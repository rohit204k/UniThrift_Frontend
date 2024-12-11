import pymongo

# Connect to the mongos instance
client = pymongo.MongoClient('')

# Access the config database
config_db = client.config

# Access the system.profile collection
profile_collection = config_db.system.profile

# Query the profiling data
operations = profile_collection.find({})

# Print the operations
for operation in operations:
    print(operation)
