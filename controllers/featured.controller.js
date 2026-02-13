import FeaturedAd from "../models/FeaturedAdvertisement.js";

export const getFeaturedAds = async (req, res) => {
  try {
    const { city } = req.query;
    const cityTerm = (city || "").trim();

    // Use explicit $and to ensure filtering is applied correctly
    const queryObj = { $and: [{ status: { $regex: "^Approved$", $options: "i" } }] };

    if (cityTerm) {
      queryObj.$and.push({
        $or: [
          // Nested fields
          { "selectedApprovedBusiness.city": { $regex: cityTerm, $options: "i" } },
          { "selectedApprovedBusiness.state": { $regex: cityTerm, $options: "i" } },
          { "selectedApprovedBusiness.businessLocation": { $regex: cityTerm, $options: "i" } },
          { "selectedApprovedBusiness.streetAddresses": { $regex: cityTerm, $options: "i" } },
          // Top-level fields (for legacy/flat structure support)
          { "city": { $regex: cityTerm, $options: "i" } },
          { "state": { $regex: cityTerm, $options: "i" } },
          { "address": { $regex: cityTerm, $options: "i" } }
        ]
      });
    }

    // Set strictQuery to false temporarily for this query or globally. 
    // Here we'll just ensure the filter is used correctly with the model.
    const ads = await FeaturedAd.find(queryObj).sort({ createdAt: -1 });

    console.log(`🔍 Featured Ads Query for city: "${cityTerm}"`);
    console.log(`🔍 Found ${ads.length} ads`);
    if (ads.length > 0) {
      console.log('🔍 Sample Ad structure:', JSON.stringify(ads[0].selectedApprovedBusiness, null, 2).slice(0, 500));
    }

    res.status(200).json({
      success: true,
      count: ads.length,
      data: ads,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};
