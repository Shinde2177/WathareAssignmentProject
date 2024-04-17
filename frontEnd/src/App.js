
import './App.css';
//import AddFile from './addfile';
 import GetData from './getdata.js';
 import { Routes, Route } from 'react-router-dom';
  import 'bootstrap/dist/css/bootstrap.min.css';
import WeatherCard from './weatherCard.js';
import UploadData from "./uploadData";
import GetAllData from './fetchAllData.js';
function App() {
  return (

    <div className="App" style={{ backgroundColor: 'ButtonHighlight' }}>
    
     <h1 >Data Anlytica </h1>
     <hr />
   

      <Routes>
        <Route exact path="/" element={<GetData />} />
        <Route exact path="/GetAllData" element={<GetAllData/>} />
        <Route path="/UploadData" element={< UploadData/>} />
      </Routes>
      <WeatherCard/>
      </div>
    // <div className="App">
    //   <WeatherCard/>
    //  <AddFile/>
    //  <GetData/>
    // </div>
  );
}

export default App;
