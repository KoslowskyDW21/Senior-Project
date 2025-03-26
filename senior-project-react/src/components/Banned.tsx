import { useState, useEffect } from "react";
import config from "../config.js";
import axios from "axios";

export default function Banned() {
  const [reasons, setReasons] = useState<string>("")

  async function checkBanStatus() {
    await axios.post(`${config.serverUrl}/admin/stillBanned`)
    .then((response) => {
      const data = response.data;
      console.log(data.message);
      console.log("Banned " + data.banned);
      if(!data.banned) {
        window.location.reload();
      }
    })
    .catch((error) => {
      console.error("Could not fetch data", error);
    });
  }

  async function getReasons() {
    await axios.get(`${config.serverUrl}/admin/reasons`)
      .then((response) => {
        setReasons(response.data.reasons);
      })
      .catch((error) => {
        console.error("Could not fetch reasons", error);
      });
  }

  useEffect(() => {
    checkBanStatus();
    getReasons();
  }, [])

  return (
    <>
      <h1>Banned</h1>
      <h3>You have been banned for:</h3>
      <h3>{reasons}</h3>
    </>
  )
}