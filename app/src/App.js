// import { Provider } from "./Context";
// import Form from "./components/Form";
// import UserList from "./components/UserList";
// import { Actions } from "./Actions";
// function App() {
//   const data = Actions();
//   return (
//     <Provider value={data}>
//       <div className="App">
//         <div className="wrapper">
//           <section className="left-side">
//             <Form />
//           </section>
//           <section className="right-side">
//             <UserList />
//           </section>
//         </div>
//       </div>
//     </Provider>
//   );
// }

// export default App;


import React from 'react';
import MyContextProvider from './contexts/MyContext';
import Home from './components/Home'
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
  return (
    <MyContextProvider>
      <Home />
    </MyContextProvider>
  );
}

export default App;