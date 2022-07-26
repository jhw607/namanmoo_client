import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import StoreCard from "../../components/StoreCard";

const WinStores = () => {
  const [data, setData] = useState([]);

  const getData = async () => {
    await axios
      .post(`${process.env.REACT_APP_ROUTE_PATH}/worker/mypage/myStore`, {
        worker_id: sessionStorage.getItem("worker_id"),
      })
      .then((res) => setData(res.data));
  };

  useEffect(() => {
    getData();
  }, []);

  return (
    <div className="mx-8 my-4">
      {data.map((e: any, index) => {
        return (
          <StoreCard
            key={index}
            mode={"OWNER_MYPAGE"}
            store={e.name}
            storeImage={`${process.env.REACT_APP_S3_PATH}${e.background_image}`}
            address={e.address}
            jobs={e.types}
            onDateClickEvent={() => {}}
          />
        );
      })}
    </div>
  );
};

export default WinStores;
