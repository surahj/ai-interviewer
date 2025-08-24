const { createClient } = require("@supabase/supabase-js");
require("dotenv").config();

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testStripeIntegration() {
  console.log("🧪 Testing Stripe Integration...\n");

  try {
    // Test 1: Check if credit packages exist
    console.log("1. Checking credit packages...");
    const { data: packages, error: packagesError } = await supabase
      .from("credit_packages")
      .select("*")
      .eq("is_active", true);

    if (packagesError) {
      console.error("❌ Error fetching packages:", packagesError);
      return;
    }

    if (!packages || packages.length === 0) {
      console.log("⚠️  No credit packages found. Creating sample packages...");

      const samplePackages = [
        {
          id: "starter",
          name: "Starter Pack",
          description: "Perfect for getting started",
          credits: 100,
          price_cents: 999,
          is_active: true,
        },
        {
          id: "professional",
          name: "Professional Pack",
          description: "For regular users",
          credits: 500,
          price_cents: 3999,
          is_active: true,
        },
        {
          id: "enterprise",
          name: "Enterprise Pack",
          description: "For power users",
          credits: 1000,
          price_cents: 6999,
          is_active: true,
        },
      ];

      const { error: insertError } = await supabase
        .from("credit_packages")
        .insert(samplePackages);

      if (insertError) {
        console.error("❌ Error creating packages:", insertError);
        return;
      }

      console.log("✅ Sample packages created successfully");
    } else {
      console.log(`✅ Found ${packages.length} active credit packages`);
      packages.forEach((pkg) => {
        console.log(
          `   - ${pkg.name}: ${pkg.credits} credits for $${(pkg.price_cents / 100).toFixed(2)}`
        );
      });
    }

    // Test 2: Check if Stripe environment variables are set
    console.log("\n2. Checking Stripe environment variables...");
    const requiredVars = [
      "STRIPE_SECRET_KEY",
      "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY",
      "STRIPE_WEBHOOK_SECRET",
    ];

    const missingVars = requiredVars.filter((varName) => !process.env[varName]);

    if (missingVars.length > 0) {
      console.log("⚠️  Missing environment variables:");
      missingVars.forEach((varName) => console.log(`   - ${varName}`));
      console.log("\nPlease add these to your .env file");
    } else {
      console.log("✅ All Stripe environment variables are set");
    }

    // Test 3: Check database structure
    console.log("\n3. Checking database structure...");

    // Check if credit_transactions table has the right structure
    const { data: transactions, error: transactionsError } = await supabase
      .from("credit_transactions")
      .select("transaction_type")
      .limit(1);

    if (transactionsError) {
      console.error("❌ Error checking transactions table:", transactionsError);
    } else {
      console.log("✅ credit_transactions table is accessible");
    }

    // Check if user_credits table exists
    const { data: credits, error: creditsError } = await supabase
      .from("user_credits")
      .select("user_id")
      .limit(1);

    if (creditsError) {
      console.error("❌ Error checking user_credits table:", creditsError);
    } else {
      console.log("✅ user_credits table is accessible");
    }

    console.log("\n🎉 Stripe integration test completed!");
    console.log("\nNext steps:");
    console.log("1. Set up your Stripe account and get API keys");
    console.log("2. Configure webhooks in your Stripe Dashboard");
    console.log("3. Test the payment flow with test cards");
    console.log("4. Check the STRIPE_SETUP.md file for detailed instructions");
  } catch (error) {
    console.error("❌ Test failed:", error);
  }
}

// Run the test
testStripeIntegration();
