import axios from "axios";
import React, { useState, useEffect } from "react";
import styles from "../styles/super.module.css";
import Link from "next/link";
import withAuth from "../components/withAuth";
import Navbar from "../components/navbar";
const URL = "http://localhost/api/supermarkets";
const URL_IN = "http://localhost/api/income";
const admin = ({ token }) => {
  const [user, setUser] = useState({});

  const [supermarkets, setsupermarkets] = useState({});
  const [income, setIncome] = useState();
  const [name, setName] = useState("");
  const [amount, setamount] = useState();
  const [price, setPrice] = useState();
  const [supermarket, setsupermarket] = useState({});
  useEffect(() => {
    getsupermarkets();
    getIncome();
    profileUser();
  }, []);
  const profileUser = async () => {
    try {
      // console.log('token: ', token)
      const users = await axios.get(`${config.URL}/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // console.log('user: ', users.data)
      setUser(users.data);
    } catch (e) {
      console.log(e);
    }
  };
  const getsupermarketById = async (id) => {
    let result = await axios.get(`${URL}/${id}`);
    console.log(result.data);
    setsupermarket(result.data);
  };

  const getIncome = async () => {
    let result = await axios.get(URL_IN);
    setIncome(result.data);
  };

  const getsupermarkets = async () => {
    let result = await axios.get(URL);
    setsupermarkets(result.data.list);
  };

  const addsupermarket = async (name,amount,price) => {
    let result = await axios.post(URL, {
      name,
      amount,
      price,
    });
    console.log(result);
    getsupermarkets();
  };

  const deletesupermarket = async (id) => {
    let result = await axios.delete(`${URL}/${id}`);
    getsupermarkets();
  };

  const updatesupermarket = async (id) => {
    let result = await axios.put(`${URL}/${id}`, {
      name,
      amount,
      price,
    });
    console.log(result);
    getsupermarkets();
  };

  const showsupermarkets = () => {
    if (supermarkets && supermarkets.length) {
      return supermarkets.map((item, index) => {
        return (
          <div className={styles.listItem} key={index}>
            <div><b>name :</b> {item.name}</div>
            <div><b>amount :</b> {item.amount}</div>
             <div> <b>price :</b> {item.price} </div>
            <div className={styles.edit_button}>
              <button
                className={styles.button_get}
                onClick={() => getsupermarketById(item.id)}
              >
                Get
              </button>
              <button
                className={styles.button_update}
                onClick={() => updatesupermarket(item.id)}
              >
                Update
              </button>
              <button
                className={styles.button_delete}
                onClick={() => deletesupermarket(item.id)}
              >
                Delete
              </button>
            </div>
          </div>
        );
      });
    } else {
      return <p>Loading...</p>;
    }
  };
  return (
    <div className={styles.container}>
      <Navbar />
      <h1>Supermarket</h1>
      <h3>Income : {income}</h3>
      <div className={styles.form_add}>
        <h2>Add supermarkets</h2>
        Name:
        <input
          type="text"
          name="name"
          onChange={(e) => setName(e.target.value)}
        ></input>
        amount:
        <input
          type="number"
          name="amount"
          onChange={(e) => setamount(e.target.value)}
        ></input>
        Price:
        <input
          type="number"
          name="price"
          onChange={(e) => setPrice(e.target.value)}
        ></input>
        <button
          className={styles.button_add}
          onClick={() => addsupermarket(name,  amount, price)}
        >
          Add
        </button>
      </div>

      <div className={styles.list}>{showsupermarkets()}</div>
    </div>
  );
};
export default withAuth(admin);

export function getServerSideProps({ req, res }) {
  return { props: { token: req.cookies.token || "" } };
}
