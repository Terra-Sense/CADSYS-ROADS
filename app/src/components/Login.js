import React, {useContext, useState} from 'react'
import {MyContext} from '../contexts/MyContext'
import logo from "../images/logo.jpeg"

function Login(){

    const {toggleNav,loginUser,isLoggedIn} = useContext(MyContext);

    const initialState = {
        userInfo:{
            email:'',
            password:'',
        },
        errorMsg:'',
        successMsg:'',
    }

    const [state,setState] = useState(initialState);

    // On change input value (email & password)
    const onChangeValue = (e) => {
        setState({
            ...state,
            userInfo:{
                ...state.userInfo,
                [e.target.name]:e.target.value
            }
        });
    }

    // On Submit Login From
    const submitForm = async (event) => {
        event.preventDefault();
        const data = await loginUser(state.userInfo);
        if(data.success && data.token){
            setState({
                ...initialState,
            });
            localStorage.setItem('loginToken', data.token);
            await isLoggedIn();
        }
        else{
            setState({
                ...state,
                successMsg:'',
                errorMsg:data.message
            });
        }
    }

    // Show Message on Error or Success
    let successMsg = '';
    let errorMsg = '';
    if(state.errorMsg){
        errorMsg = <div className="error-msg">{state.errorMsg}</div>;
    }
    if(state.successMsg){
        successMsg = <div className="success-msg">{state.successMsg}</div>;
    }

    return(
        <>
            <div className="maincontainer">
                <nav className="navbar navbar-expand-lg navbar-primary bg-primary sticky-top d-flex justify-content-between ">
                    <div className="navbar-nav col-2 align-items-start ">
                        <div className="text-white bg_color_primary_light rounded-circle p-2">
                            <img width={30} height={30} src={logo} alt="logo" />
                        </div>
                    </div>

                    <div className="col-4 justify-content-center">
                        <div className="navbar-nav ml-auto text-white">
                            CADSYS - ROADS
                        </div>
                    </div>

                    <div className="justify-content-center" id="navbarNavDropdown">
                        <div className="navbar-nav ml-auto text-white">
                            LOGO
                        </div>
                    </div>
                </nav>
                <div className="container mb-5 mt-5">
                    <div className="_loginRegister">
                        <h1>Login</h1>
                        <form onSubmit={submitForm} noValidate>
                            <div className="form-control">
                                <label>Email</label>
                                <input name="email" type="email" required placeholder="Enter your email" value={state.userInfo.email} onChange={onChangeValue} />
                            </div>
                            <div className="form-control">
                                <label>PassWord</label>
                                <input name="password" type="password" required placeholder="Enter your password" value={state.userInfo.password} onChange={onChangeValue} />
                            </div>
                            {errorMsg}
                            {successMsg}
                            <div className="form-control">
                                <button type="submit">Login</button>
                            </div>
                        </form>
                        <div className="form-control _navBtn">
                            <button onClick={toggleNav}>Register</button>
                        </div>
                    </div>
                </div>
            </div >
            <div style={{ position: 'absolute', bottom: 0, width: "100vw", textAlign: 'center', background: "#0d6efd", color: "white", padding: "3px", fontSize: "small" }}>
                © Copyright 2021-2022
            </div>
        </>
    );
}

export default Login;