import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { createPolygon, erasePolygon, getPolygonPath, makePolygon } from './createPolygon';
import colors from '../../../../Common/Color';
import { drawPolygon } from './createPolygon';
import { insertManualCard } from './manualCard';
import { getDisasterList } from './DisasterList';
import { findPath } from './findLoad';
import LocationSelector from "../Sections/LocationSelector";

// 이미지 import
import pinicon from '../../../../images/pin.png';
import backarrow from "../../../../images/left-arrow.png";
import typhoon from "../../../../images/hurricane.png";
import forestFire from "../../../../images/forest-fire.png";
import landslide from "../../../../images/landslide.png";
import flood from "../../../../images/flood.png";
import heavyRain from "../../../../images/heavy-rain.png";
import hot from "../../../../images/hot.png";
import fog from "../../../../images/fog.png";
import heavySnow from "../../../../images/heavy-snow.png";
import earthquake from "../../../../images/earthquake.png";
import tsunami from "../../../../images/tsunami.png";
import yellowDust from "../../../../images/yellow-dust.png";
import fire from "../../../../images/fire.png";
import carAccident from "../../../../images/accident.png";
import missing from "../../../../images/missing.png";
import user from "../../../../images/user.png";

/**Map Container를 감싸는 최종 부모 컴포넌트 */
const Container = styled.div`
    width: 100%;
    height: 100%;
`;

const disasterTypeToImage = {
    "태풍": typhoon,
    "산불": forestFire,
    "산사태": landslide,
    "홍수": flood,
    "호우": heavyRain,
    "폭염": hot,
    "안개": fog,
    "대설": heavySnow,
    "지진": earthquake,
    "해일": tsunami,
    "황사": yellowDust,
    "화재": fire,
    "교통사고": carAccident,
    "실종": missing,
  };

/**
 * 일단 더미데이터. title이름 지울까 말까..
 */
const dummyLocations = [
    { disasterTypeToImage: "폭염", lat: 36.611044, lng: 127.286428, title: "Location 1" },
    { disasterTypeToImage: "태풍", lat: 36.611291, lng: 127.357820, title: "Location 2" },
    { disasterTypeToImage: "산불", lat: 37.289198, lng: 127.012131, title: "Location 3" },
    { disasterTypeToImage: "화재", lat: 35.102102, lng: 129.030605, title: "이재모피자" },
  ];
  

const { kakao } = window;

/**
 * 비동기 처리로 polygonList를 받아주는 함수
 */
const getPolygonlist = async (sd_list) =>{
  const resultList = await makePolygon(sd_list)
  console.log('in func')
  console.log(resultList)
  return resultList
}


const MapContainer = ({ searchPlace }) => {
    const [map, setMap] = useState(undefined);
    //현재 화면에 있는 다각형 객체 리스트 
    const [polygonList, setPolygonList] = useState([])
    const [locations, setLocations] = useState([]);
    //현재 재난 정보 소캣 데이터 받을 시에 바뀜
    const [disasteList , setDisasterList] = useState([])
    //zoom이 바뀔때마다 리랜더링을 통해서 보이게할 지도 컨텐츠를 조절하기 위함
    const [zoom, setZoom] = useState(undefined)
    /**
     * 기존의 폴리곤을 지우고 새로운폴리곤을 그리는 함수
     */
    const renewPolygon = async (sd_list) =>{
      //기존 polygon지우기
      erasePolygon(polygonList, map)
      const newPolygonList = await makePolygon(sd_list)
      drawPolygon(newPolygonList, map)
      setPolygonList(newPolygonList)
    }
    /**
     * MapCotainer가 마운트 / 언마운트 될때만 작동한는 Hook
     * 1) 웹소캣의 함수들의 정의 2) 웹소캣 connect / disconnect를 다룸
     */
    const handleLocationSelect = (location) => {
      // 예제 좌표 데이터 (실제로는 total_code_revised.xlsx에서 가져오기.)
      const coordinates = {
        "서울특별서 서대문구 천연동": { lat: 37.57246803097317, lon:126.95456868160035 },
        "서울특별시 서대문구 홍제1동": { lat: 37.58663517380208, lon: 126.94075008836593 },
        "부산광역시 기장군 장안읍": {lat: 35.341538209873704, lon: 129.25924414776276},
        "부산광역시 기장군 철마면": {lat: 35.28979586486741, lon: 129.14602983502212},
        "부산광역시 부산진구 연지동": {lat: 35.174402409097375, lon: 129.05393899065228}
        // ... 기타 도시 좌표 ...
      };
  
      const loc = coordinates[location];
      if (loc && map) {
        const locPosition = new kakao.maps.LatLng(loc.lat, loc.lon);
        map.setCenter(locPosition);
      }
    };
    useEffect(() => {
      const mapContainer = document.getElementById('map');
      const mapOption = {
          center: new kakao.maps.LatLng(37.541, 126.986),
          level: 4
      };
      const map = new kakao.maps.Map(mapContainer, mapOption);
  
      // 지도 객체를 상태에 저장
      setMap(map);
      
      
      // 사용자 위치에 따른 지도 중심 설정
      if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
              function (position) {
                  var lat = position.coords.latitude,
                      lon = position.coords.longitude;
                  var locPosition = new kakao.maps.LatLng(lat, lon);
                  map.setCenter(locPosition); // 지도의 중심을 현재 위치로 설정

                  // 현재 위치에 마커 찍기
                  const userMarkerImage = new kakao.maps.MarkerImage(user, new kakao.maps.Size(50, 50));
                  const userMarker = new kakao.maps.Marker({
                      map: map,
                      position: locPosition,
                      image: userMarkerImage
                  });
              },
              function (error) { // 위치 정보를 얻어오기 실패했을 때의 처리
                  alert("위치 파악을 실패하였습니다");
                  var defaultPosition = new kakao.maps.LatLng(33.450701, 126.570667);
                  map.setCenter(defaultPosition); // 지도의 중심을 기본 위치로 설정
              }
          );
      } else {
          var defaultPosition = new kakao.maps.LatLng(33.450701, 126.570667);
          map.setCenter(defaultPosition); // 지도의 중심을 기본 위치로 설정
      }
      // WebSocket 연결 생성
      const websocket = new WebSocket("wss://lvb2z5ix97.execute-api.ap-northeast-2.amazonaws.com/dev?token=sometoken");
      websocket.onopen = () => {
        console.log("Connected to the WebSocket");
        // 연결이 수립되면 메시지 전송
        websocket.send(JSON.stringify({ action: "onData" }));
      };
      websocket.onmessage = (event) => {
        console.log("Received message:", JSON.parse(event.data));
        // 수신한 데이터를 state에 저장
      
        setDisasterList(getDisasterList(JSON.parse((event.data))))
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
        console.log('언마운트 후 disconnected')
        websocket.close();
      };
  }, []);
  
  useEffect(() => {
    if (map){
      if(disasteList){
        const sd_list = []
        disasteList.forEach(disaster => {
          const location_list = disaster.location_code
        
          location_list.forEach(location_code => {
            sd_list.push(Number(location_code))
          });
        });

        //폴리곤을 갱신해주기
        renewPolygon(sd_list)
        
      }

      //zoom이 바뀔때 마다 메뉴얼카드 추가 / 삭제
      kakao.maps.event.addListener(map, 'zoom_changed', function() {
        var level = map.getLevel();
        console.log('zoom Changed')
        console.log(level)
        if (level < 9){
          insertManualCard(map)
        }
        setZoom(level)
      })
    
      const imageSrc =pinicon;
      const imageSize = new kakao.maps.Size(50, 50);
      const markerImage = new kakao.maps.MarkerImage(imageSrc, imageSize);
      
    /**
     * dummy데이터를 읽고 지도 객체에 마커 표시
    useEffect(() => {
      const mapContainer = document.getElementById('map');
      const mapOption = {
          center: new kakao.maps.LatLng(36.498649, 127.268141),
          level: 5
      };
  
      const map = new kakao.maps.Map(mapContainer, mapOption);
      setMap(map);
  
  
      dummyLocations.forEach(loc => {
        const markerPosition = new kakao.maps.LatLng(loc.lat, loc.lng);
        const imageSrc = disasterTypeToImage[loc.disasterTypeToImage];   // 매핑된 이미지 가져오기
        const imageSize = new kakao.maps.Size(50, 50);
        const markerImage = new kakao.maps.MarkerImage(imageSrc, imageSize);
    
        
        const marker = new kakao.maps.Marker({
            map: map,
            position: markerPosition,
            image: markerImage
        });
        
        const overlayPosition = new kakao.maps.LatLng(loc.lat, loc.lng);
        
        const customOverlay = new kakao.maps.CustomOverlay({
            position: overlayPosition,
            content: `<div>${loc.title}</div>`,
            yAnchor: 1.5  
        });
        
        let isOverlayShown = false;  
        // 마커에 클릭 이벤트 설정
        kakao.maps.event.addListener(marker, 'click', function() {
          if (isOverlayShown) {
              customOverlay.setMap(null);  // 오버레이 숨기기
          } else {
              customOverlay.setMap(map);   // 오버레이 보여주기
          }
  
          isOverlayShown = !isOverlayShown;  // 상태 토글
      });
    
        // 기본적으로 커스텀 오버레이는 숨김 상태
        customOverlay.setMap(null);
    });
  
    
      /**
     * 다각형지도 Drawing
     */
    dummyLocations.forEach(location => {
      const markerPosition = new kakao.maps.LatLng(location.lat, location.lng);
      
      const marker = new kakao.maps.Marker({
          map: map,
          position: markerPosition,
          image: markerImage
      });
      
      const overlayPosition = new kakao.maps.LatLng(location.lat, location.lng);
      
      const customOverlay = new kakao.maps.CustomOverlay({
          position: overlayPosition,
          content: `<div>${location.title}</div>`,
          yAnchor: 1.5  
      });
      
      let isOverlayShown = false;  
      // 마커에 클릭 이벤트 설정
      kakao.maps.event.addListener(marker, 'click', function() {
        if (isOverlayShown) {
            customOverlay.setMap(null);  // 오버레이 숨기기
        } else {
            customOverlay.setMap(map);   // 오버레이 보여주기
        }

        isOverlayShown = !isOverlayShown;  // 상태 토글
      });
  
      // 기본적으로 커스텀 오버레이는 숨김 상태
      customOverlay.setMap(null);
      });
    }
    

  }, [searchPlace, locations, disasteList]);
    

  /**
   * 길찾기 Drawing
   * */ 

  useEffect(() => {
    // findPath(map, 출발지 위도, 출발지 경도, 도착지 위도, 도착지 경도)
    // 조치원역 : 36.601107352826, 127.29651502894
    // 고려대학교 세종캠퍼스 : 36.610261563595, 127.29307759409
    findPath(map);
  }, [map]);

    return (
        <Container>
          <LocationSelector onLocationSelect={handleLocationSelect} />
            <div id="map" style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '100%',
                height: '100%',
            }}>
            </div>
        </Container>
    );
  };


export default MapContainer;
