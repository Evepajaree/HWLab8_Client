import useSWR, { mutate } from "swr";
import axios from "axios";
import React, { useState, useEffect } from "react";
//import styles from "../styles/Home.module.css";
import styles from "../styles/Index.module.css";
import Link from 'next/link'
import Navbar from "../components/navbar";
const URL = "http://localhost/api/supermarkets";
const URL_BUY = "http://localhost/api/purchase";
const fetcher = (key) => fetch(key).then((res) => res.json());
const index = () => {
  const { data, error } = useSWR(URL, fetcher, { revalidateOnFocus: false });
  if (error) return <div>failed to load</div>;
  if (!data) return <div>Loading...</div>;
  console.log("data", data);
  
  const buysupermarket = async (id) => {
    let result = await axios.post(`${URL_BUY}/${id}`)
    mutate(URL, data);
  }

  const showsupermarkets = () => {
    if (data.list && data.list.length) {
      return data.list.map((item, index) => {
        return (
          <div className={styles.listItem} key={index}>
            <div><b>name :</b> {item.name}</div>
            <div><b>amount :</b> {item.amount}</div>
             <div> <b>price :</b> {item.price} </div>
            
            
            <div>
            <button
              className={styles.btn}
              onClick={() => buysupermarket(item.id)}
            >
              Buy
            </button></div>
          </div>
        );
      });
    } else {
      return <p>Loading...</p>;
    }
  };
  return (
    <div className={styles.container}><Navbar />
      <div className={styles.title}>
      Supermarket</div>
      <div className={styles.list}>
        {showsupermarkets()}
      </div>
      
    </div>
  );
};
export default index;
