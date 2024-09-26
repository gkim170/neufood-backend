1. neufood's org in mongodb: https://cloud.mongodb.com/v2#/org/6202cf22d485fb436a663e77/projects

2. database "neufood" in collections: https://cloud.mongodb.com/v2/6202cf22f6de914b29ce1014#metrics/replicaSet/621e877535c4153786dc3ffc/explorer/neufood/recipes/find

3. I add one collection recipes under the database recipes, under which I add two item

4. install mangoDB cli for mac
```
brew install mongocli
```

5. connect to cluster locally: https://cloud.mongodb.com/v2/6202cf22f6de914b29ce1014#clusters/commandLineTools/Cluster0
I successfully connect to it using MongoDB shell, but I can't connect to it through MongoDB Compass: connection <monitor> to 52.86.205.228:27017 closed

6.mongoimport/ mongoexport can be used to import/export csv file to MondoDB, but I cannot install them
```
brew install mongodb-database-tools
```
7. add IP address 0.0.0.0/0 into MongoDB network access. Then anyone can get access to database (use shell or MongoDB Compass).
  
8. use MongoDB Compass to import and export data
