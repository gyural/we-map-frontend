import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { createPolygon, getPolygonPath } from './createPolygon';
import colors from '../../../../Common/Color';
import { drawPolygon } from './createPolygon';
// import FindLoad from './FindLoad';


const Container = styled.div`
  width: 100%;
  height: 100%;
`;
const { kakao } = window

const MapContainer = ({ searchPlace }) => {
  const [socketListenr, setSocketListenr] = useState([])
  
  useEffect(() => {
    // WebSocket 연결 생성
    const websocket = new WebSocket("wss://lvb2z5ix97.execute-api.ap-northeast-2.amazonaws.com/dev?token=sometoken");
    websocket.onopen = () => {
      console.log("Connected to the WebSocket");
      // 연결이 수립되면 메시지 전송
      websocket.send(JSON.stringify({ action: "onData" }));
    };
    websocket.onmessage = (event) => {
      console.log("Received message:", event.data);
      // 수신한 데이터를 state에 저장
      setSocketListenr(JSON.parse((event.data)));
    };
    websocket.onerror = (error) => {
      console.error("WebSocket Error:", error);
    };
    websocket.onclose = (event) => {
      if (event.wasClean) {
        console.log(`Closed cleanly, code=${event.code}, reason=${event.reason}`);
      } else {
        console.error("Connection died");
      }
    };
    // 컴포넌트 언마운트 시 연결 종료
    return () => {
      websocket.close();
    };
  }, []);
  
  useEffect(() => {
    
    var infowindow = new kakao.maps.InfoWindow({ zIndex: 1 })
    const container = document.getElementById('myMap')
    const options = {
      center: new kakao.maps.LatLng(37.541, 126.986),
      level: 10,
    }
    const map = new kakao.maps.Map(container, options)

    const ps = new kakao.maps.services.Places()
    ps.keywordSearch(searchPlace, placesSearchCB)
    function placesSearchCB(data, status, pagination) {
      if (status === kakao.maps.services.Status.OK) {
        let bounds = new kakao.maps.LatLngBounds()
        for (let i = 0; i < data.length; i++) {
          displayMarker(data[i])
          bounds.extend(new kakao.maps.LatLng(data[i].y, data[i].x))
        }
        map.setBounds(bounds)
      }
    }
    function displayMarker(place) {
      let marker = new kakao.maps.Marker({
        map: map,
        position: new kakao.maps.LatLng(place.y, place.x),
      })
      // 마커에 클릭이벤트 등록
      kakao.maps.event.addListener(marker, 'click', function () {
        // 마커를 클릭 시 장소명이 인포윈도우 표출
        infowindow.setContent('<div style="padding:5px;font-size:12px;">' + place.place_name + '</div>')
        infowindow.open(map, marker)
      })
    }
    /**
     * 다각형지도 Drawing
     */
    console.log(socketListenr)
    if(socketListenr){
      const sd_list = []
      socketListenr.forEach(element => {
        sd_list.push(Number(element.location_id))
      });
      drawPolygon(map, sd_list)

    }
  }, [searchPlace, socketListenr])

  /**
   * 길찾기 Drawing
   */

  


  return (
    <Container>
    <div
        id="myMap"
        style={{
          position: 'absolute', 
          top: '50%', 
          left: '50%', 
          transform: 'translate(-50%, -50%)', 
          width: '100%', 
          height: '100%', 
      }}>
  </div>
    </Container>
        
    
  )
}

export default MapContainer;
