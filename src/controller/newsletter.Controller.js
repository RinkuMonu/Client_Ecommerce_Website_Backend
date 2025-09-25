import NewsletterModal from "../models/Newsletter.modal.js";

// ✅ Subscribe user
export const subscribeNewsletter = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res
        .status(400)
        .json({ success: false, message: "Email is required" });
    }

    // Check if already subscribed
    let existing = await NewsletterModal.findOne({ email });
    if (existing && existing.status === "subscribed") {
      return res
        .status(400)
        .json({ success: false, message: "Already subscribed" });
    }

    if (existing) {
      existing.status = "subscribed";
      await existing.save();
      return res
        .status(200)
        .json({ success: true, message: "Resubscribed successfully" });
    }

    // New subscription
    const newSubscriber = await NewsletterModal.create({ email });
    res.status(201).json({
      success: true,
      message: "Subscribed successfully",
      data: newSubscriber,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ Unsubscribe user
export const unsubscribeNewsletter = async (req, res) => {
  try {
    const { email } = req.body;

    let user = await NewsletterModal.findOne({ email });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "Email not found" });
    }

    user.status = "unsubscribed";
    await user.save();

    res
      .status(200)
      .json({ success: true, message: "Unsubscribed successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ Get all subscribers
export const getSubscribers = async (req, res) => {
  try {
    const subscribers = await NewsletterModal.find({
      status: "subscribed",
    }).sort({
      subscribedAt: -1,
    });
    res.status(200).json({ success: true, data: subscribers });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
export const deleteSubscriber = async (req, res) => {
  try {
    const { id } = req.params;

    const subscriber = await NewsletterModal.findByIdAndDelete(id);

    if (!subscriber) {
      return res.status(404).json({
        success: false,
        message: "Subscriber not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Subscriber deleted successfully",
    });
  } catch (error) {
    console.log(error);
    
    res.status(500).json({
      success: false,
      message: "Error deleting subscriber",
      error: error.message,
    });
  }
};
