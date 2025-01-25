import { createClient } from "@supabase/supabase-js";
import { sendNotification } from './notifications';

// if (!supabaseUrl || !supabaseAnonKey) {
//   console.error(
//     "Missing Supabase environment variables. Please check your .env file."
//   );
//   console.log("Required variables:");
//   console.log("VITE_SUPABASE_URL:", supabaseUrl ? "Set" : "Missing");
//   console.log("VITE_SUPABASE_ANON_KEY:", supabaseAnonKey ? "Set" : "Missing");
// }

const getSupabaseConfig = (schoolId) => {
  switch (schoolId) {
    case 'school1':
      return {
        url: import.meta.env.VITE_SUPABASE_URL_SCHOOL1,
        anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY_SCHOOL1,
      };
    case 'school2':
      return {
        url: import.meta.env.VITE_SUPABASE_URL_SCHOOL2,
        anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY_SCHOOL2,
      };
    case 'school3':
      return {
        url: import.meta.env.VITE_SUPABASE_URL_SCHOOL3,
        anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY_SCHOOL3,
      };
    default:
      throw new Error('Invalid schoolId');
  }
};

const schoolId = localStorage.getItem('selectedSchool') || 'school1';

const { url: supabaseUrl, anonKey: supabaseAnonKey } = getSupabaseConfig(schoolId);
let supabase = createClient(supabaseUrl, supabaseAnonKey);
export { supabase };

// User role helper
export const isAdmin = (user) => {
  return user?.email === "admin@gemsdaa.net" || false;
};

// Auth helper functions
export const signUpWithEmail = async (email, password) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${window.location.origin}/login`,
      data: {
        email_confirmed: true,
      },
    },
  });
  return { data, error };
};

export const signInWithEmail = async (email, password) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  return { data, error };
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  return { error };
};

// Database helper functions
export const getProducts = async () => {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("name");
  return { data, error };
};

export const createUserProfile = async (profileData) => {
  try {
    const { data, error } = await supabase
      .from("user_profiles")
      .insert([profileData])
      .select()
      .single();

    if (error) {
      console.error("Error creating profile:", error);
      await deleteAuthUser(profileData.id);
      throw error;
    }

    return { data, error: null };
  } catch (error) {
    console.error("createUserProfile error:", error);
    return { data: null, error };
  }
};

export const getUserProfile = async (userId) => {
  try {
    const { data, error } = await supabase
      .from("user_profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle();

    if (error) {
      console.error("Error fetching profile:", error);
      throw error;
    }


    return { data, error: null };
  } catch (error) {
    console.error("getUserProfile error:", error);
    return { data: null, error };
  }
};

export const updateUserProfile = async (userId, profileData) => {
  try {
    const { data, error } = await supabase
      .from("user_profiles")
      .update(profileData)
      .eq("id", userId)
      .select()
      .single();

    if (error) {
      console.error("Error updating profile:", error);
      throw error;
    }

    return { data, error: null };
  } catch (error) {
    console.error("updateUserProfile error:", error);
    return { data: null, error };
  }
};

export const createOrder = async (orderData) => {
  try {
    const { data: profile, error: profileError } = await getUserProfile(
      orderData.user_id
    );
    if (profileError) throw profileError;

    let productsQuery = supabase
      .from("products")
      .select("id, name, stock_quantity");

    if (orderData.items[0]?.id) {
      productsQuery = productsQuery.in(
        "id",
        orderData.items.map((item) => item.id)
      );
    } else {
      productsQuery = productsQuery.in(
        "name",
        orderData.items.map((item) => item.name)
      );
    }

    const { data: products, error: stockError } = await productsQuery;

    if (stockError) {
      console.error("Error checking stock:", stockError);
      return { error: stockError };
    }

    const stockMap = {};
    for (const product of products) {
      stockMap[product.id] = product;
      stockMap[product.name] = product;
    }

    const updatedItems = orderData.items.map((item) => {
      const product = stockMap[item.id] || stockMap[item.name];
      if (!product) {
        throw new Error(`Product not found: ${item.name || item.id}`);
      }
      return {
        ...item,
        id: product.id,
        name: product.name,
      };
    });

    for (const item of updatedItems) {
      const product = stockMap[item.id] || stockMap[item.name];
      if (product.stock_quantity < item.quantity) {
        return {
          error: {
            message: `Not enough stock for ${item.name}. Available: ${product.stock_quantity}, Requested: ${item.quantity}`,
          },
        };
      }
    }

    // Create the order with profile data
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert([
        {
          ...orderData,
        },
      ])
      .select()
      .single();

    if (orderError) {
      console.error("Error creating order:", orderError);
      return { error: orderError };
    }


    // Update stock for each item
    for (const item of updatedItems) {
      const product = stockMap[item.id] || stockMap[item.name];
      const newStock = product.stock_quantity - item.quantity;

      const { error: updateError } = await supabase
        .from("products")
        .update({ stock_quantity: newStock })
        .eq("id", item.id);

      if (updateError) {
        console.error(`Error updating stock for ${item.name}:`, updateError);
        return { error: updateError };
      }
    }
    // Format notification message
    const itemsList = orderData.items.map(item => `${item.name} x ${item.quantity}`).join('\n');
    const notificationMessage = `Name: ${profile.firstName} ${profile.lastName}\n${itemsList}`;

    // Send ntfy.sh notification
    await sendNotification('New Order Created', notificationMessage);

    return { data: order, error: null };
  } catch (error) {
    console.error("Error in createOrder:", error);
    return { error: { message: error.message } };
  }
};

export const updateProduct = async (id, updates) => {
  const { data, error } = await supabase
    .from("products")
    .update(updates)
    .eq("id", id)
    .select();
  return { data, error };
};

export const fixInvalidStockValues = async () => {
  const { data: products, error: fetchError } = await supabase
    .from("products")
    .select("*")
    .or("stock.is.null,stock.lt.0");

  if (fetchError) {
    console.error("Error fetching products:", fetchError);
    return { error: fetchError };
  }

  if (products && products.length > 0) {
    const updates = products.map((product) => ({
      id: product.id,
      stock: 0,
    }));

    const { error: updateError } = await supabase
      .from("products")
      .upsert(updates);

    if (updateError) {
      console.error("Error updating products:", updateError);
      return { error: updateError };
    }
  }

  return { data: products, error: null };
};

// supabase.js
export const getUserOrders = async (userId) => {
  try {
    const { data, error } = await supabase
      .from("orders")
      .select(
        `
        *,
        user_profiles:user_id(
          email,
          phone,
          role,
          details
        )
      `
      )
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Supabase error:", error);
      throw error;
    }

    return { data, error: null };
  } catch (error) {
    console.error("getUserOrders error:", error);
    return { data: null, error };
  }
};

export const updateOrderStatus = async (orderId, status) => {
  try {
    const { data, error } = await supabase
      .from("orders")
      .update({ status })
      .eq("id", orderId)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error("Error updating order status:", error);
    return { data: null, error };
  }
};

export const deleteAuthUser = async (userId) => {
  try {
    const { error } = await supabase.rpc("delete_user", { user_id: userId });
    if (error) throw error;
    return { error: null };
  } catch (error) {
    console.error("Error deleting auth user:", error);
    return { error };
  }
};

export const checkGemsIdExists = async (gemsId, excludeUserId = null) => {
  try {
    let query = supabase
      .from("user_profiles")
      .select("id")
      .eq("gems_id_last_six", gemsId);

    // If we're updating a profile, exclude the current user's ID
    if (excludeUserId) {
      query = query.neq("id", excludeUserId);
    }

    const { data, error } = await query;

    if (error) throw error;

    return { exists: data.length > 0, error: null };
  } catch (error) {
    console.error("Error checking GEMS ID:", error);
    return { exists: false, error };
  }
};

// Image upload helper functions
export const uploadProductImage = async (file, productId) => {
  try {
    const fileExt = file.name.split(".").pop();
    const fileName = `products/${productId}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from("images")
      .upload(fileName, file, {
        cacheControl: "3600",
        upsert: true,
      });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      throw uploadError;
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("images").getPublicUrl(fileName);

    return { publicUrl, error: null };
  } catch (error) {
    console.error("Error uploading image:", error);
    return { publicUrl: null, error };
  }
};

export const deleteProductImage = async (fileName) => {
  try {
    // Extract just the file path from the full URL
    const filePath = fileName.includes("/")
      ? fileName.split("/images/")[1]
      : `products/${fileName}`;

    const { error } = await supabase.storage.from("images").remove([filePath]);

    if (error) {
      console.error("Delete error:", error);
    }

    return { error };
  } catch (error) {
    console.error("Error deleting image:", error);
    return { error };
  }
};

export const getAdminOrders = async () => {
  try {
    const { data, error } = await supabase
      .from("orders")
      .select(
        `
        *,
        user_profiles:user_id(
          firstName,
          lastName,
          email,
          phone,
          role,
          details
        )
      `
      )
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Supabase error:", error);
      throw error;
    }

    return { data, error: null };
  } catch (error) {
    console.error("getAdminOrders error:", error);
    return { data: null, error };
  }
};

export const getOrderInfo = async (orderId) => {
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .select('*')
    .eq('id', orderId)
    .single();
  if (orderError) throw orderError;

  const { data: profile, error: profileError } = await getUserProfile(order.user_id);
  if (profileError) throw profileError;

  const cartItems = order.items.map((item) => ({
    name: item.name,
    price: item.price,
    quantity: item.quantity
  }));

  const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return { profile, cartItems, total, orderMode: order.mode };
};

export const reorderItems = async (orderId) => {
  const { profile, cartItems, total, orderMode } = await getOrderInfo(orderId);

  const newOrderData = {
    user_id: profile.id,
    total_amount: total,
    items: cartItems,
    mode: orderMode,
    status: 'pending',
  };

  const { data: newOrder, error } = await supabase
    .from('orders')
    .insert([newOrderData])
    .single();

  if (error) throw error;
  
  // Format notification message
  const itemsList = cartItems.map(item => `${item.name} x ${item.quantity}`).join('\n');
  const notificationMessage = `Name: ${profile.firstName} ${profile.lastName}\n${itemsList}`;

  // Send ntfy.sh notification
  await sendNotification('New Order Created', notificationMessage);

  return newOrder;
}; 

export const sendMagicLink = async (email) => {
  try {
    const { data, error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: false,
        emailRedirectTo: 'http://oisgarden.vercel.app/shop',
      },
    });
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error sending magic link:', error);
    return { data: null, error };
  }
};

export const verifyOtp = async (token_hash, type) => {
  try {
    const { error } = await supabase.auth.verifyOtp({ token_hash, type });
    if (error) throw error;
    return { error: null };
  } catch (error) {
    console.error('Error verifying OTP:', error);
    return { error };
  }
};