
const colors = {
  
}

const Login = () => {
    return (
    <div className='login-image-container'>
      <img src = "login_image.png" className="login-image" />
      <img src = "login_rectangular.png" className="login-rectangular" />
      <div id = "login_text">
        <h1 className="text-4xl text-[#333333] font-semibold">Login</h1>
      </div>
      <div className="login-form">
        <div className="input-container">
         <input type="text" className="styled-input" placeholder="ID" />
        </div>
        <div className="input-container">
          <input type="password" className="styled-input" placeholder="PW" />
        </div>
        <div className="input-container">
          <button className="styled-button">로그인</button>
        </div>
      </div>

      <img src = "login_bar.png" className="login-bar"/>
    </div>

    )
  }
  
  export default Login