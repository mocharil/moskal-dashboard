import { useState } from "react";
import { useSnackbar } from "notistack";
import FormControl from "@mui/joy/FormControl";
import IconButton from '@mui/joy/IconButton';
import FormLabel from "@mui/joy/FormLabel";
import Checkbox from "@mui/joy/Checkbox";

import FormHelperText from "@mui/joy/FormHelperText";
import Input from "@mui/joy/Input";

import CustomText from "../../components/CustomText";

import "./styles/Login.css";
import CustomButton from "../../components/CustomButton";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";

import { login } from "../../helpers/redux/slice/loginSlice";
import authService from "../../services/authService";

import {
  addKeywords,
  setActiveKeyword,
} from "../../helpers/redux/slice/keywordSlice";
import { getProjects } from "../../services/projectService";

const Login = () => {
  const navigate = useNavigate(); // Initialize navigation function
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const [isSignIn, setIsSignIn] = useState(true);

  const [emailLogin, setEmailLogin] = useState("");
  const [passwordLogin, setPasswordLogin] = useState("");
  const [showPasswordLogin, setShowPasswordLogin] = useState(false);
  const [isRememberChecked, setIsRememberChecked] = useState(false);

  const [isLoginError, setIsLoginError] = useState(false);
  const [isButtonLoginLoading, setIsButtonLoginLoading] = useState(false);

  const [nameRegister, setNameRegister] = useState("");
  const [emailRegister, setEmailRegister] = useState("");
  const [passwordRegister, setPasswordRegister] = useState("");

  const [isButtonRegisterLoading, setIsButtonRegisterLoading] = useState(false);

  const handleOnChangeEmailLogin = (event) => {
    setEmailLogin(event.target.value);
  };

  const handleOnChangePasswordLogin = (event) => {
    setPasswordLogin(event.target.value);
  };

  const handleClickShowPasswordLogin = () => setShowPasswordLogin((show) => !show);

  const handleOnChangeRemember = (event) => {
    setIsRememberChecked(event.target.value);
  };

  const handleOnChangeNameRegister = (event) => {
    setNameRegister(event.target.value);
  };

  const handleOnChangeEmailRegister = (event) => {
    setEmailRegister(event.target.value);
  };

  const handleOnChangePasswordRegister = (event) => {
    setPasswordRegister(event.target.value);
  };

  const handleLogin = async () => {
    try {
      setIsButtonLoginLoading(true);
      const data = await authService.login(emailLogin, passwordLogin);
  
      
      // Check if user object exists
      if (!data.user) {
        console.error("User object is missing in the API response:", data);
      enqueueSnackbar("Login failed: Invalid API response format", { variant: "error" });
        setIsButtonLoginLoading(false);
        return;
      }
      
      const { access_token, refresh_token, token_type, user } = data;
      
      // Verify user object has required properties
      if (!user.name || !user.email || !user.id) {
        console.error("User object is missing required properties:", user);
      enqueueSnackbar("Login failed: Missing user information", { variant: "error" });
        setIsButtonLoginLoading(false);
        return;
      }

      // Example: store in Redux (or local state)
      dispatch(
        login({
          name: user.name,
          email: user.email,
          token: access_token,
          refreshToken: refresh_token,
          tokenType: token_type,
          userId: user.id,
          expiresInDays: isRememberChecked ? 30 : 1,
        })
      );
      enqueueSnackbar("Login Success", { variant: "success" });
      setIsButtonLoginLoading(false);
      checkProject();
    } catch (error) {
      const errorDetail = error?.detail;
      console.log("error", error);
      console.log("error detail", errorDetail);

      if (errorDetail === "Incorrect email or password") {
        enqueueSnackbar("Email or password is incorrect.", { variant: "error" });
        setIsLoginError(true);
      } else if (errorDetail === "Please verify your email first") {
        enqueueSnackbar("Please verify your email before logging in.", { variant: "error" });
      } else {
        enqueueSnackbar("Something went wrong. Please try again.", { variant: "error" });
        console.error("Login failed:", error);
      }
      setIsButtonLoginLoading(false);
    }
  };

  const checkProject = async () => {
    try {
      const projectData = await getProjects();

      // Validate the structure of projectData
      if (!projectData || !Array.isArray(projectData.owned_projects) || !Array.isArray(projectData.accessible_projects)) {
        console.error("Invalid project data structure from getProjects:", projectData);
        navigate("/onboard"); // Navigate to onboard or an error page
        return;
      }

      // Filter out null, undefined, or non-object entries from project lists
      const ownedProjects = projectData.owned_projects.filter(p => p && typeof p === 'object');
      const accessibleProjects = projectData.accessible_projects.filter(p => p && typeof p === 'object');

      if (ownedProjects.length > 0 || accessibleProjects.length > 0) {
        // Dispatch all valid projects for keyword list
        dispatch(
          addKeywords({
            keywords: [...ownedProjects, ...accessibleProjects], // Use filtered and validated projects
            days: 30,
          })
        );

        let projectToUse = null;

        // Prefer first owned project if it's valid and has a name
        if (ownedProjects.length > 0 && ownedProjects[0].name) {
          projectToUse = ownedProjects[0];
        } 
        // Else, prefer first accessible project if it's valid and has a name
        else if (accessibleProjects.length > 0 && accessibleProjects[0].name) {
          projectToUse = accessibleProjects[0];
        } 
        // Fallback: find the first project (owned preferred) that has a name
        else {
          projectToUse = [...ownedProjects, ...accessibleProjects].find(p => p && p.name);
        }
        
        if (projectToUse && projectToUse.name) {
          dispatch(
            setActiveKeyword({
              activeKeyword: projectToUse,
              days: 30,
            })
          );
          navigate(
            `/${projectToUse.name}/dashboard`,
            { replace: true }
          );
        } else {
          // No project with a name was found after filtering and checking
          console.warn("No valid project with a name found for navigation/activation. Navigating to onboard.");
          navigate("/onboard");
        }
      } else {
        // Both project lists are empty after filtering
        navigate("/onboard");
      }
    } catch (error) {
      console.error("Error in checkProject:", error);
      navigate("/onboard"); // Fallback navigation on any error
    }
  };

  const handleRegister = async () => {
    try {
      setIsButtonRegisterLoading(true);
      const data = await authService.register(
        emailRegister,
        nameRegister,
        passwordRegister
      );
     
      enqueueSnackbar("Login Success", { variant: "success" });
      setIsButtonRegisterLoading(false);
      handleChangeToLogin();
    } catch (error) {
      console.error("Register failed:", error);

      const res = error?.response;

      if (res?.status === 422 && Array.isArray(res.data?.detail)) {
        // Extract validation message(s)
        const firstError = res.data.detail[0];
        const message = firstError?.msg || "Validation failed.";

        enqueueSnackbar(message, { variant: "error" });
      } else {
        enqueueSnackbar("Something went wrong. Please try again.", { variant: "error" });
        console.error("Register error:", error);
      }
      setIsButtonRegisterLoading(false);
    }
  };

  const handleChangeToLogin = () => {
    setIsSignIn(true);
    setNameRegister("");
    setEmailRegister("");
    setPasswordRegister("");
    setIsButtonRegisterLoading(false);
  };

  const handleChangeToRegister = () => {
    setIsSignIn(false);
    setEmailLogin("");
    setPasswordLogin("");
    setIsLoginError(false);
    setIsButtonLoginLoading(false);
  };

  const isButtonRegisterDisabled = () => {
    return (
      nameRegister.trim() === "" ||
      emailRegister.trim() === "" ||
      passwordRegister.trim() === ""
    );
  };

  const isButtonLoginDisabled = () => {
    return emailLogin.trim() === "" || passwordLogin.trim() === "";
  };

  return (
    <>
      <div className="login-page">
        <div className="login-container">
          <img
            className="login-moskal-icon"
            src={window.location.origin + "/MOSKAL.svg"}
          />
          {isSignIn ? (
            <>
              <div>
                <CustomText size="s" bold="semibold" color="b900">
                  Welcome Back
                </CustomText>
                <CustomText size="xls" color="b600 " inline>
                  Please enter your account details to sign in.
                </CustomText>
              </div>
              <FormControl>
                <FormLabel>
                  <CustomText color="b700" inline>
                    Email
                  </CustomText>
                  <CustomText color="brand">*</CustomText>
                </FormLabel>
                <Input
                  placeholder="Enter your email business email"
                  value={emailLogin}
                  onChange={handleOnChangeEmailLogin}
                  error={isLoginError}
                />
                {isLoginError && (
                  <FormHelperText>
                    <CustomText color="r600" inline>
                      Please check your email address and try again
                    </CustomText>
                  </FormHelperText>
                )}
              </FormControl>
              <FormControl>
                <FormLabel>
                  <CustomText color="b700" inline>
                    Password
                  </CustomText>
                  <CustomText color="brand">*</CustomText>
                </FormLabel>
                <Input
                  placeholder="********"
                  type={showPasswordLogin ? "text" : "password"}
                  value={passwordLogin}
                  onChange={handleOnChangePasswordLogin}
                  error={isLoginError}
                  endDecorator={
                    <IconButton
                      onClick={handleClickShowPasswordLogin}
                      // onMouseDown={handleMouseDownPassword} // Optional: to prevent focus shift
                      edge="end"
                      variant="plain"
                      color="neutral"
                      sx={{ marginRight: '-0.25rem' }} // Adjust spacing if needed
                    >
                      <img 
                        src={showPasswordLogin ? window.location.origin + "/eye-open.svg" : window.location.origin + "/eye-close.svg"} 
                        alt={showPasswordLogin ? "Hide password" : "Show password"} 
                        style={{ width: '20px', height: '20px', opacity: 0.7 }}
                      />
                    </IconButton>
                  }
                />
                {isLoginError && (
                  <FormHelperText>
                    <CustomText color="r600" inline>
                      Please check your password address and try again
                    </CustomText>
                  </FormHelperText>
                )}
              </FormControl>
              <div className="login-remember">
                <div className="login-remember-checkbox-container">
                  <Checkbox
                    value={isRememberChecked}
                    onChange={handleOnChangeRemember}
                  />
                  <CustomText size="2xls" inline>
                    Remember for 30 days
                  </CustomText>
                </div>
                <CustomText
                  size="2xls"
                  color="brand"
                  bold="semibold"
                  inline
                  pointer
                  onClick={() => window.location.href = "https://login.moskal.id/forgot-password"}
                >
                  Forgot Password
                </CustomText>
              </div>
              <CustomButton
                onClick={handleLogin}
                disabled={isButtonLoginDisabled()}
                loading={isButtonLoginLoading}
              >
                Sign in{" "}
              </CustomButton>
              <div className="login-bottom-text-container">
                <CustomText size="2xls" inline>
                  Don't have account?
                </CustomText>
                <CustomText
                  size="2xls"
                  color="brand"
                  bold="semibold"
                  inline
                  pointer
                  onClick={handleChangeToRegister}
                >
                  Sign up
                </CustomText>
              </div>
            </>
          ) : (
            <>
              <div>
                <CustomText size="s" bold="semibold" color="b900">
                  Welcome Back
                </CustomText>
                <CustomText size="xls" color="b600 " inline>
                  Sign up in less than 2 minutes.
                </CustomText>
              </div>
              <FormControl>
                <FormLabel>
                  <CustomText color="b700" inline>
                    Name
                  </CustomText>
                  <CustomText color="brand">*</CustomText>
                </FormLabel>
                <Input
                  placeholder="Enter your name"
                  value={nameRegister}
                  onChange={handleOnChangeNameRegister}
                />
              </FormControl>
              <FormControl>
                <FormLabel>
                  <CustomText color="b700" inline>
                    Email
                  </CustomText>
                  <CustomText color="brand">*</CustomText>
                </FormLabel>
                <Input
                  placeholder="Enter your email"
                  value={emailRegister}
                  onChange={handleOnChangeEmailRegister}
                />
              </FormControl>
              <FormControl>
                <FormLabel>
                  <CustomText color="b700" inline>
                    Password
                  </CustomText>
                  <CustomText color="brand">*</CustomText>
                </FormLabel>
                <Input
                  placeholder="Create a password"
                  type="password"
                  value={passwordRegister}
                  onChange={handleOnChangePasswordRegister}
                />
                <FormHelperText>Must be at least 8 characters. </FormHelperText>
              </FormControl>

              <CustomButton
                disabled={isButtonRegisterDisabled()}
                onClick={handleRegister}
                loading={isButtonRegisterLoading}
              >
                Get Started
              </CustomButton>

              <div className="login-bottom-text-container">
                <CustomText size="2xls" inline>
                  Already have an account?
                </CustomText>
                <CustomText
                  size="2xls"
                  color="brand"
                  bold="semibold"
                  inline
                  pointer
                  onClick={handleChangeToLogin}
                >
                  Log in
                </CustomText>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default Login;
