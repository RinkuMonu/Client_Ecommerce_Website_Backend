import crypto from "crypto";

// ✅ LIVE ENVIRONMENT
const merchantId = "236e6378d80e492f95283a119417ef01";
const secretKey = "dca86ef26e4f423d938c00d52d2c2a5b";
const apiUrl = "https://api.zaakpay.com/api/paymentTransact/V8";

const generateZaakpayChecksum = (params, secretKey) => {
  const filteredParams =
    Object.keys(params)
      .filter(
        (key) =>
          params[key] !== null &&
          params[key] !== undefined &&
          params[key] !== ""
      )
      .sort()
      .map((key) => `${key}=${params[key]}`)
      .join("&") + "&";

  console.log("✅ String used for checksum:", filteredParams);

  const checksum = crypto
    .createHmac("sha256", secretKey)
    .update(filteredParams)
    .digest("hex");

  console.log("✅ Generated Checksum:", checksum);
  return checksum;
};

export const generatePayment = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { userId, amount, category, reference, name, mobile, email } = req.body;

    if (!amount || !email) {
      return res.status(400).json({
        success: false,
        message: "Amount and Email are required",
      });
    }

    const user = await User.findOne({
      _id: req?.user?.id || userId,
      status: true,
    }).session(session);

    const service = await servicesModal.findOne({ _id: category });
    if (!service) {
      return res.status(400).json({ success: false, message: "Service not found" });
    }

    if (!user) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ success: false, message: "User not found or inactive" });
    }

    // Unique order/reference ID
    const referenceId = `ZAAK${Date.now()}`;

    // Create Transaction
    const [transaction] = await Transaction.create(
      [
        {
          user_id: user._id,
          transaction_type: "credit",
          amount: Number(amount),
          type: service._id,
          balance_after: user.eWallet,
          payment_mode: "wallet",
          transaction_reference_id: referenceId,
          description: `PayIn initiated for ${user.name}`,
          status: "Pending",
        },
      ],
      { session }
    );

    // Create PayIn
    const [payIn] = await PayIn.create(
      [
        {
          userId: user._id,
          fromUser: user._id,
          mobile: user.mobileNumber,
          email: user.email,
          reference: referenceId,
          name: user.name,
          source: "PayIn",
          amount: Number(amount),
          type: service._id,
          charges: 0,
          remark: "Payment Pending",
          status: "Pending",
        },
      ],
      { session }
    );

    /**
     * 🧾 Prepare Zaakpay Payload
     */
    const payload = {
      amount: (amount * 100).toString(), // convert to paise
      buyerEmail: email,
      buyerFirstName: name || user.name,
      currency: "INR",
      merchantIdentifier: merchant_identifier,
      orderId: referenceId,
      productDescription: "Wallet Top-up",
      returnUrl: "https://yourdomain.com/api/status",
    };

    // ✅ Generate checksum (Zaakpay expects SHA256 HMAC with & at end)
    const checksum = generateZaakpayChecksum(payload, secretKey);

    // ✅ Create final payload with checksum
    const finalPayload = { ...payload, checksum };

    console.log("🔹 Zaakpay Request Payload:", finalPayload);

    /**
     * 🌐 Step 1: Create Zaakpay Payment URL
     */
    const queryString = Object.entries(finalPayload)
      .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
      .join("&");

    const paymentUrl = `${apiUrl}?${queryString}`;

    // 🔹 Commit and return URL
    await session.commitTransaction();
    session.endSession();

    return res.status(200).json({
      success: true,
      message: "Zaakpay payment URL generated successfully",
      paymentUrl,
      referenceId,
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("❌ Zaakpay PayIn Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Something went wrong while processing payment",
    });
  }
};

export const zaakpayCallback = async (req, res) => {
  try {
    const response = req.body;
    console.log("✅ Zaakpay Callback Response:", response);

    const receivedChecksum = response.checksum;
    delete response.checksum;

    const calculatedChecksum = generateZaakpayChecksum(response, secretKey);

    if (receivedChecksum === calculatedChecksum) {
      console.log("✅ Checksum verified successfully");

      if (response.responseCode === "100") {
        console.log("🎉 Payment Successful for Order:", response.orderId);
      } else {
        console.log("❌ Payment Failed for Order:", response.orderId);
      }

      return res.send(`<h3>Payment status updated successfully.</h3>`);
    } else {
      console.log("❌ Invalid checksum received in callback");
      return res.status(400).send("Invalid checksum received.");
    }
  } catch (error) {
    console.error("Callback Error:", error);
    res.status(500).send("Internal Server Error in Callback");
  }
};
