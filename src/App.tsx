import React, { useEffect, useState } from "react";
import "tailwindcss/tailwind.css";
import { BrowserRouter, Route, Routes, useNavigate } from "react-router-dom";
import InitPage from "./pages/InitPage";
import LoginPage from "./pages/LoginPage";
import OwnerStoreNamePage from "./pages/OwnerStoreNamePage";
import OwnerStoreLocationPage from "./pages/OwnerStoreLocationPage";
import OwnerJobTypePage from "./pages/OwnerJobTypePage";
import OwnerMyPage from "./pages/OwnerMyPage";
import OwnerCompletePage from "./pages/OwnerCompletePage";
import OwnerUploadPage from "./pages/OwnerUploadPage";
import OwnerWagePage from "./pages/OwnerWagePage";
import WorkerLocationPage from "./pages/WorkerLocationPage";
import WorkerDistancePage from "./pages/WorkerDistancePage";
import WorkerHomePage from "./pages/WorkerHomePage";
import WorkerInterviewPage from "./pages/WorkerInterviewPage";
import WorkerNearWorkPage from "./pages/WorkerNearWorkPage.jsx";
import WorkerReserveWorkPage from "./pages/WorkerReserveWorkPage.jsx";
import WorkMyPage from "./pages/WorkMyPage";
import OwnerRecruitNoticePage from "./pages/OwnerRecruitNoticePage";
import WorkerSpeedGetJob from "./pages/WorkerSpeedGetJob";
import WorkerSpeedResultPage from "./pages/WorkerSpeedResultPage";
import CommonInterviewPage from "./pages/CommonInterviewPage";
import { firebaseApp } from "./firebase";
import WorkerQrCode from "./pages/WorkerQrCode";
import OwnerQrCode from "./pages/OwnerQrCode";
import OwnerAngelResult from "./pages/WorkerAngelResult";
import ChatListPage from "./pages/ChatListPage";
import ChatRoomPage from "./pages/ChatRoomPage";
import io from "socket.io-client";

function App() {
  const [isTokenFound, setTokenFound] = useState(false);
  const [myToken, setMyToken] = useState("");
  const firebaseMessaging = firebaseApp.messaging();

  firebaseMessaging
    .requestPermission()
    .then(() => {
      return firebaseMessaging.getToken(); // 등록 토큰 받기
    })
    .then(function (token: any) {
      console.log(token); //토큰 출력
      sessionStorage.setItem("FCM_TOKEN", token);
      setMyToken(token);
    })
    .catch(function (error: any) {
      console.log("FCM Error : ", error);
    });

  firebaseMessaging.onMessage((payload: any) => {
    const { title, body } = payload.data;
    const link = payload.link;
    const data = JSON.parse(body);

    console.log("들어오니???????", data, title);

    if (title === "알바천사 콜") {
      // WORKER
      if (
        window.confirm(
          title + " : " + data["store_name"] + "에서 알바천사 호출하셨습니다."
        )
      ) {
        sessionStorage.setItem("angel_id", data["angel_id"]);
        window.location.assign(
          `${process.env.REACT_APP_ROUTE_PATH}/worker/AngelResult`
        );
      }
    } else if (title === "알바천사 결과") {
      // OWNER
      if (data["result"] === "success") {
        if (
          window.confirm(
            title +
              " : " +
              "알바천사 " +
              data["worker_name"] +
              "님이 수락하셨습니다."
          )
        ) {
          sessionStorage.setItem("angel_id", data["angel_id"]);
          window.location.assign(
            `${process.env.REACT_APP_ROUTE_PATH}/owner/mypage`
          );
        }
      } else if (title === "면접 결과") {
        if (
          window.confirm(
            title + " : " + data["store_name"] + "에서 면접 결과가 왔습니다."
          )
        ) {
          console.log("가자 >>>>> ", title, data["store_name"]);
          // sessionStorage.setItem("angel_id", data["angel_id"]);
          window.location.assign(
            `${process.env.REACT_APP_ROUTE_PATH}/worker/mypage`
          );
        }
      } else {
        alert(title + " : " + "지금 날아올 알바천사가 없습니다.");
      }
    } else {
    }
  });

  const SOCKET_SERVER_URL = `${process.env.REACT_APP_SOCKET_SERVER}`;
  const socket = io.connect(SOCKET_SERVER_URL);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/*" element={<InitPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/owner/storename" element={<OwnerStoreNamePage />} />
        <Route
          path="/owner/storelocation"
          element={<OwnerStoreLocationPage />}
        />
        <Route path="/owner/jobtype" element={<OwnerJobTypePage />} />
        <Route path="/owner/upload" element={<OwnerUploadPage />} />
        <Route path="/owner/wage" element={<OwnerWagePage />} />
        <Route path="/owner/complete" element={<OwnerCompletePage />} />
        <Route path="/owner/mypage" element={<OwnerMyPage />} />
        <Route path="/owner/recruit" element={<OwnerRecruitNoticePage />} />
        <Route path="/worker/location" element={<WorkerLocationPage />} />
        <Route path="/worker/distance" element={<WorkerDistancePage />} />
        <Route path="/worker/home" element={<WorkerHomePage />} />
        <Route path="/chatlist" element={<ChatListPage socket={socket} />} />
        <Route path="/chatroom" element={<ChatRoomPage socket={socket} />} />
        {/* 면접 신청 페이지 */}
        <Route path="/worker/interview" element={<WorkerInterviewPage />} />
        {/* 주변 일감 */}
        <Route path="/worker/nearWork" element={<WorkerNearWorkPage />} />
        {/* 알바 예약*/}
        <Route path="/worker/reserveWork" element={<WorkerReserveWorkPage />} />
        {/* 마이 페이지 */}
        <Route path="/worker/mypage" element={<WorkMyPage />} />
        {/* 면접 */}
        <Route
          path="/interview"
          element={<CommonInterviewPage socket={socket} />}
        />
        {/* 바로 알바 */}
        <Route path="/worker/speed" element={<WorkerSpeedGetJob />} />
        {/* 바로 알바 결과*/}
        <Route
          path="/worker/speed/result"
          element={<WorkerSpeedResultPage />}
        />

        {/* QRCODE - WORKER */}
        <Route path="/worker/qrCode" element={<WorkerQrCode />} />
        {/* QRCODE - OWNER */}
        <Route path="/owner/qrCode" element={<OwnerQrCode />} />

        {/* 알바천사 - OWNER */}
        <Route path="/worker/AngelResult" element={<OwnerAngelResult />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
