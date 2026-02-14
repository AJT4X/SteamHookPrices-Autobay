from flask import Flask , render_template, request,jsonify
import json
import sqlite3
from flask_cors import CORS
from datetime import time, datetime
import time

db = 'db_hook.db'

app = Flask(__name__)
CORS(app)

class DB:
    def __init__(self,db,info=None):
        self.db_path = db
        self.info = info

    def connect(self):
        return sqlite3.connect(self.db_path)

    def work(self):
        try:
            with self.connect() as con:
                cursor = con.cursor()

                cursor.execute("""
                    CREATE TABLE IF NOT EXISTS hook(
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    data TEXT,
                    hook_key TEXT UNIQUE,
                    item_id INTEGER,
                    name_code TEXT,
                    price_order INTEGER,
                    price_sell INTEGER,
                    timestamp INTEGER,
                    currency TEXT
                )
                """)

                con.commit()

            with self.connect() as con:
                
                cursor = con.cursor()
                for item in self.info:
                    key_from_db = item.get('key')
                    item_id = item.get('item_id',0)
                    name_code = item.get('name_code','-')
                    price_order = item.get('price_order',0)
                    price_sell = item.get('price_sell',0)
                    timestamp = item.get('timestamp')
                    currency = item.get('currency')
                    data = item.get('date')

                    cursor.execute("""
                        INSERT INTO hook(
                        hook_key, item_id, name_code,price_order,
                        price_sell, timestamp,currency,data
                        )
                        VALUES(?,?,?,?,?,?,?,?)
                        ON CONFLICT(hook_key) DO UPDATE SET
                            item_id = excluded.item_id,
                            name_code = excluded.name_code,
                            price_order = excluded.price_order,
                            price_sell = excluded.price_sell,
                            timestamp = excluded.timestamp,
                            data = excluded.data,
                            currency =  excluded.currency
                    WHERE excluded.timestamp > hook.timestamp
                    """,(
                    key_from_db,
                    item_id,
                    name_code,
                    price_order,
                    price_sell,
                    timestamp,
                    currency,
                    data
                    ))

            con.commit()
            return "ok"
        except Exception as e:
            print(e)
            return e
            

@app.route('/save_db_hook',methods=['POST'])
def start():
    data = request.get_json()
    db_work = DB(db,data).work()    
    if db_work == 'ok':
        return jsonify({'status' :'ok'}),200
    else:
        return jsonify ({'status' : "error",'msg' : str(db_work)}),500

if __name__ == '__main__':
    app.run(port=5009)