"use client";
import { useRef, useState } from "react";
import IconButton from "@mui/material/IconButton";

import { useRouter } from "next/navigation";
import {
  Box,
  Typography,
  Button,
  TextField,
  useMediaQuery,
  Grid,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { auth } from "../firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { checkValidData } from "./validate";

const Login = () => {
  const [isSignInForm, setIsSignInForm] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);
  const router = useRouter();
  const email = useRef(null);
  const password = useRef(null);
  const fullname = useRef(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const handleButtonClick = () => {
    const message = checkValidData(
      email.current.value,
      password.current.value
      // fullname.current.value
    );
    setErrorMessage(message);

    if (message) return;
    if (!isSignInForm) {
      createUserWithEmailAndPassword(
        auth,
        email.current.value,
        password.current.value
      )
        .then((userCredential) => {
          router.push("/aichatbot");
        })
        .catch((error) => {
          const errorMessage = error.message;
          setErrorMessage("Invalid Credentials, " + errorMessage);
        });
    } else {
      //sign in
      signInWithEmailAndPassword(
        auth,
        email.current.value,
        password.current.value
      )
        .then(() => {
          // Signed in
          router.push("/aichatbot");
        })
        .catch((error) => {
          const errorCode = error.code;
          const errorMessage = error.message;
          console.log(errorMessage);
          setErrorMessage("Invalid Credentials" + ", " + errorMessage);
        });
    }
  };

  const toggleSignInForm = () => {
    setIsSignInForm(!isSignInForm);
  };

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      height="100vh"
      sx={{
        backgroundColor: "black",
      }}
    >
      <Grid container justifyContent="center">
        <Grid
          item
          xs={12}
          sm={8}
          md={6}
          lg={4}
          sx={{
            bgcolor: "#fff",
            p: 4,
            border: "3px solid yellow",
            borderRadius: 4,
            boxShadow: '0 0 10px rgba(255, 255, 255, 0.2)',
          }}
        >
          <Typography variant="h4" component="h1" gutterBottom align="center">
            {isSignInForm ? "Sign In" : "Sign Up"}
          </Typography>
          <form onSubmit={(e) => e.preventDefault()} style={{ width: "100%" }}>
            {!isSignInForm && (
              <TextField
                inputRef={fullname}
                label="Full Name"
                variant="outlined"
                fullWidth
                margin="normal"
              />
            )}
            <TextField
              inputRef={email}
              label="Email Address"
              type="email"
              variant="outlined"
              fullWidth
              margin="normal"
            />
            <TextField
              inputRef={password}
              label="Password"
              type="password"
              variant="outlined"
              fullWidth
              margin="normal"
            />
            {errorMessage && (
              <Typography color="error" variant="body2" sx={{ mt: 2 }}>
                {errorMessage}
              </Typography>
            )}
            <Button
              variant="filled"
              color="warning"
              fullWidth
              //sx={{ mt: 1, borderColor: 'white', color: 'white' }}
              sx={{ mt: 2, border: '2px solid black', color: 'black'  }}
              onClick={handleButtonClick}
            >
              {isMobile
                ? isSignInForm
                  ? "Sign In"
                  : "Sign Up"
                : isSignInForm
                ? "Sign In to Your Account"
                : "Create Your Account"}
            </Button>
            <Typography variant="body2" sx={{ mt: 2 }}>
              {isSignInForm ? (
                <>
                  New User?{" "}
                  <Button
                    variant="text"
                    color="primary"
                    sx={{
                      textDecoration: "underline",
                      cursor: "pointer",
                      padding: 0,
                      minWidth: "auto",
                      "&:hover": {
                        backgroundColor: "transparent", // To remove background on hover
                      },
                    }}
                    onClick={toggleSignInForm}
                  >
                    Sign up now
                  </Button>
                  .
                </>
              ) : (
                <>
                  Already registered?{" "}
                  <Button
                    variant="text"
                    color="primary"
                    sx={{
                      textDecoration: "underline",
                      cursor: "pointer",
                      padding: 4,
                      minWidth: "auto",
                      "&:hover": {
                        backgroundColor: "transparent", // To remove background on hover
                      },
                    }}
                    onClick={toggleSignInForm}
                  >
                    Sign In now
                  </Button>
                  .
                </>
              )}
            </Typography>
          </form>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Login;
