import pymongo


class Database(object):
    URI = "mongodb://localhost:27017"
    DATABASE = None

    @staticmethod
    def initialize():
        client = pymongo.MongoClient(Database.URI)
        Database.DATABASE = client['ProcessBud']

    @staticmethod
    def insert(collection, data):
        return Database.DATABASE[collection].insert_one(data)

    @staticmethod
    def find(collection, query):
        return Database.DATABASE[collection].find(query)

    @staticmethod
    def find_one(collection, query):
        return Database.DATABASE[collection].find_one(query)

    @staticmethod
    def del_many(collection, query):
        return Database.DATABASE[collection].delete_many(query)
