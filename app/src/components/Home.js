import React, { useContext } from 'react'
import { MyContext } from '../contexts/MyContext'
import 'bootstrap/dist/css/bootstrap.min.css';

// Importing the Login & Register Componet
import Login from './Login'
import Register from './Register'
import logo from "../images/logo.jpeg"

function Home() {

    const { rootState, logoutUser } = useContext(MyContext);
    const { isAuth, theUser, showLogin } = rootState;

    // If user Logged in
    if (isAuth) {
        return (
            <>
                <div className="maincontainer">
                    <nav className="navbar navbar-expand-md navbar-light bg-light">
                        <img width={30} height={30} src={logo} alt="logo" />
                        <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
                            <span className="navbar-toggler-icon"></span>
                        </button>
                        <div className="collapse navbar-collapse" id="navbarNav">
                            {/* <ul className="nav navbar-nav ml-auto">
                                <li className="nav-item active">
                                    <a className="nav-link" href="#">Home <span className="sr-only">(current)</span></a>
                                </li>
                                <li className="nav-item">
                                    <a className="nav-link" href="#">Features</a>
                                </li>
                                <li className="nav-item">
                                    <a className="nav-link" href="#">Pricing</a>
                                </li>
                                <li className="nav-item">
                                    <a className="nav-link disabled" href="#">Disabled</a>
                                </li>
                            </ul> */}
                        </div>
                        <div className="nav navbar-nav navbar-right">
                            <a className="navbar-brand"> Weclome {theUser.name},</a>
                            <a href="#" className="navbar-brand" onClick={logoutUser}>Logout</a>
                        </div>
                    </nav>
                    <div className="container mb-5 mt-5">
                        <div className="userInfo">
                            <div className="_img"><span role="img" aria-label="User Image">👦</span></div>
                            <h1>{theUser.name}</h1>
                            <div className="_email"><span>{theUser.email}</span></div>
                        </div>
                    </div>
                </div>
                <div style={{ position: 'absolute', bottom: 0, width: "100vw", textAlign: 'center', background: "blue", color: "white", padding: "3px" }}>
                    © Copyright 2021-2022
                </div>
            </>
        )
    }
    // Showing Login Or Register Page According to the condition
    else if (showLogin) {
        return <Login />;
    }
    else {
        return <Register />;
    }

}

export default Home;