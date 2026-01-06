import React, { useEffect, useRef } from 'react'
import ConfigSidebar from '../Pages/Dashboard/Configure/ConfigSidebar'
import CloudConfig from '../Pages/Dashboard/Configure/cloudConfig.jsx';
import { Routes, Route, useLocation } from 'react-router-dom';
import Api from '../Pages/Dashboard/Configure/Api';
import InstallApps from '../Pages/Dashboard/Configure/InstalledApps';
import ApiConfig from '../Pages/Dashboard/Configure/Api';

const ConfigPage = () => {
  const location = useLocation();
  const mainRef = useRef(null);

  useEffect(() => {
    if (mainRef.current) {
      mainRef.current.scrollTop = 0;
    }
  }, [location.pathname]);

  return (
    <div className="flex overflow-hidden" style={{ height: 'calc(100vh - 64px)' }}>
      <ConfigSidebar/>

      <main 
        ref={mainRef}
        className="flex-1 bg-gray-50 h-full overflow-y-auto ml-0 lg:ml-80"
      >
        <div className="p-4 sm:p-6">
          <Routes>
            <Route index element={<CloudConfig/>} />
            <Route path="/installesapps" element={<InstallApps/>} />
            <Route path='/api' element={<ApiConfig/>}/>
          </Routes>
        </div>
      </main>
    </div>
  )
}

export default ConfigPage