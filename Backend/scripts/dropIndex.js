const mongoose = require('mongoose');
const WelfareOrganization = require('../models/WelfareOrganization');

async function dropIndex() {
  try {
    // Connect to MongoDB
    await mongoose.connect('mongodb://localhost:27017/cryptopaws', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Connected to MongoDB');

    // Drop the unique index on blockchainAddress
    await WelfareOrganization.collection.dropIndex('blockchainAddress_1');
    console.log('Successfully dropped the unique index on blockchainAddress');

    // Create a new non-unique index
    await WelfareOrganization.collection.createIndex({ blockchainAddress: 1 }, { unique: false, sparse: true });
    console.log('Successfully created new non-unique index on blockchainAddress');

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

dropIndex(); 