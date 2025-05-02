const mongoose = require('mongoose');
const WelfareOrganization = require('../models/WelfareOrganization');
const Case = require('../models/Case');
require('dotenv').config();

async function fixNullWelfares() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/cryptopaws');
    console.log('Connected to MongoDB');

    // Find all cases with null welfare organizations
    const cases = await Case.find({ createdBy: null });
    console.log(`Found ${cases.length} cases with null welfare organizations`);

    // For each case, create a new welfare organization
    for (const caseItem of cases) {
      console.log(`Processing case: ${caseItem._id}`);
      
      // Create a new welfare organization for this case
      const welfare = new WelfareOrganization({
        name: `Welfare Organization for ${caseItem.title || caseItem._id}`,
        email: `welfare_${caseItem._id}@example.com`,
        password: 'temporary_password', // This should be changed by the welfare org
        phone: '0000000000',
        address: 'Temporary Address',
        description: 'Temporary welfare organization for migrated case',
        website: 'https://example.com',
        status: 'pending',
        blockchainAddress: '0x' + Math.random().toString(16).slice(2, 42),
        blockchainStatus: {
          isRegistered: true,
          isActive: true,
          totalDonations: "0",
          uniqueDonors: 0
        }
      });

      await welfare.save();
      console.log(`Created new welfare organization for case ${caseItem._id}`);

      // Update the case with the new welfare organization
      caseItem.createdBy = welfare._id;
      await caseItem.save();
      console.log(`Updated case ${caseItem._id} with new welfare organization`);
    }

    console.log('Migration completed successfully');
  } catch (error) {
    console.error('Error during migration:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the migration
fixNullWelfares(); 