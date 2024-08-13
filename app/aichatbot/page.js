"use client";
import Image from "next/image";
import { useState, useEffect } from "react";
import { borderColor, Box, color, Stack, keyframes } from "@mui/system";
import { Button, TextField, Typography, Rating, Grid} from "@mui/material";
import Markdown from "react-markdown";
import SendIcon from "@mui/icons-material/Send";
import IconButton from "@mui/material/IconButton";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "../firebase";
import LogoutIcon from "@mui/icons-material/Logout";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";


const typewriter = keyframes`
  0% {
    width: 0;
  }
  100% {
    width: 100%;
  }
`;

const blink = keyframes`
  50% {
    border-color: transparent;
  }
  100% {
    border-color: black;
  }
`;


const style = {
  transition: "all 0.4s ease",
  "&:hover": {
    transform: "scale(1.05)",
    boxShadow: "0 6px 8px rgba(0,0,0,0.15)",
    borderColor: "black",
  },
  justifyContent: "center",
};

const style_1 = {
  transition: "all 0.4s ease",
  "&:hover": {
    transform: "scale(1.05)",
    boxShadow: "0 6px 8px rgba(0,0,0,0.15)",
    borderColor: "black",
  },
  justifyContent: "center",
  alignItems: "center",
  position: "absolute",
  top: "20%",
  left: "20%",
};

export default function Home() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Hi! I'm your support agent 🕵️ today, how can I assist you?",
      rating: null, // Add rating property
    },
  ]);

  const [message, setMessage] = useState("");

  const sendMessages = async () => {
    setMessage("");
    setMessages((messages) => [
      ...messages,
      { role: "user", content: message, rating: null },
      { role: "assistant", content: "", rating: null},
    ]);
    const response = fetch("api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify([...messages, { role: "user", content: message }]),
    }).then(async (res) => {
      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      let result = "";
      return reader.read().then(function processText({ done, value }) {
        if (done) {
          return result;
        }
        const text = decoder.decode(value || new Int8Array(), { stream: true });
        setMessages((messages) => {
          let lastMessage = messages[messages.length - 1];
          let otherMessages = messages.slice(0, messages.length - 1);
          return [
            ...otherMessages,
            {
              ...lastMessage,
              content: lastMessage.content + text,
            },
          ];
        });
        return reader.read().then(processText);
      });
    });
  };

  const handleRatingChange = (index, newValue) => {
    setMessages((messages) => {
      const updatedMessages = [...messages];
      updatedMessages[index].rating = newValue;
      return updatedMessages;
    });
  };

  const handleLogout = async () => {
    await signOut(auth);
  };
  if (loading) {
    return <Typography>Loading...</Typography>;
  }

  if (!user) {
    return <Typography>Please log in.</Typography>;
  }
  return ( 
    <Box
      width="100vw"
      height="100vh"
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      //borderRadius={12}
      backgroundColor="black"
    >
      
      <Box
        sx={{
          position: "absolute",
          top: "20px",
          right: "20px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          "&:hover .email": {
            opacity: 1,
            visibility: "visible",
            color: "yellow"
          },
          "@media (max-width: 600px)": {
            top: "10px",
            right: "10px",
          },
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <AccountCircleIcon sx={{ color: "#333", fontSize: 30 }} />
          <Button
            variant="contained"
            onClick={handleLogout}
            sx={{
              marginLeft: 1,
              backgroundColor: "#333",
              color: "#fff",
              "&:hover": { backgroundColor: "#555" },
              borderRadius: "8px",
              padding: "4px 8px",
              minWidth: "auto",
              height: "36px",
              "@media (max-width: 600px)": {
                height: "30px",
                padding: "3px 6px",
              },
            }}
          >
            <LogoutIcon />
          </Button>
        </Box>
        <Typography
          className="email"
          sx={{
            color: "#333",
            fontWeight: "bold",
            mt: 1,
            opacity: 0,
            visibility: "hidden",
            transition: "opacity 0.3s ease, visibility 0.3s ease",
            fontSize: "14px",
            "@media (max-width: 600px)": {
              fontSize: "12px",
            },
          }}
        >
          {user.email}
        </Typography>
      </Box>
  
      <Stack
        direction="column"
        width={{ xs: "80%", sm: "70%", md: "40%", lg: "40%" }}
        height="600px"
        border="3px solid white"
        borderRadius={10}
        p={2}
        spacing={3}
        sx={{
          "@media (max-width: 700px)": {
            height: "80%",
          },
        }}
      >
        <Stack
          direction="column"
          spacing={2}
          flexGrow={1}
          overflow="auto"
          maxHeight="100%"
        >
          {messages.map((message, index) => (
            <Box
              key={index}
              display="flex"
              justifyContent={
                message.role === "assistant" ? "flex-start" : "flex-end"
              }
            >
              <Box
                //sx={style}
                backgroundColor={
                  message.role === "assistant" ? "white" : "orange"
                }
                color={message.role === "assistant" ? "black" : "black"}
                fontWeight={500}
                borderRadius={8}
                padding={3}
                //maxWidth="80%"
                sx={{
                  "@media (max-width: 600px)": {
                    padding: 1,
                  },
                }}
                
              >
                {message.content}
               
                <Box>
            {message.role === "assistant" && (
              <>
              <Rating
                name={`rating-${index}`}
                value={message.rating || 0}
                onChange={(event, newValue) =>
                  handleRatingChange(index, newValue)
                }
                sx={{ mt: 1 }}
              /> 
            
              <Typography 
               variant="h6" 
               fontWeight="light" 
               fontSize={10}
               
               sx={{ color: 'gray', fontStyle: 'italic', ml:1,
                overflow: 'hidden',
                whiteSpace: 'nowrap',
                letterSpacing: '0.1em',
                animation: `${typewriter} 4s steps(40, end), ${blink} 0.75s step-end infinite`,

                }}
            >
              rate the response
            </Typography>
            </>
              
            )}
            
            </Box>
              </Box>
            </Box>
          ))}
        </Stack>
      
        <Stack direction="row" spacing={3} padding={1}>
          <TextField
            label="message"
            fullWidth={10}
            color="warning"
            variant="outlined"
            padding={2}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            InputProps={{
              style: { color: 'yellow' }
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                '& fieldset': {
                  borderColor: 'white',
                },
              },
              '& .MuiInputLabel-root': {
                color: 'white',
              },
              "@media (max-width: 600px)": {
                padding: 1,
              },
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                sendMessages();
              }
            }}
          />
          <IconButton
            aria-label="send"
            onClick={sendMessages}
            color="warning"
            sx={style}
            size="normal"
          >
            <SendIcon />
          </IconButton>
        </Stack>
      </Stack>
    </Box>
    
  );
};
