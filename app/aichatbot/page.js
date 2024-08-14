"use client";
import Image from "next/image";
import { useState, useEffect,ChangeEvent } from "react";
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
  const [userUrl, setUserUrl] = useState("");

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

  const handleUserUrlChange = (event) => {
    setUserUrl(event.target.value);
  };
  
  const handleUserQuestionChange = (event) => {
    setUserQuestion(event.target.value);
  };
  
  const fetchWebpageData = async (e) => {
    console.log(
      "Calling pinecone-insert-data API to scrape webpage data and insert to DB"
    );
    const res = await fetch("/api/pinecone-insert-data", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ url: userUrl }),
    });
    const data = await res.json();
    console.log(data);
  };

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
            fontWeight: "normal",
            mt: 1,
            opacity: 0,
            visibility: "hidden",
            transition: "opacity 0.3s ease, visibility 0.3s ease",
            fontSize: "14px",
            "@media (max-width)": {
              fontSize: "12px",
            },
          }}
        >
          {user.email}
        </Typography>
      </Box>
      <div className="grid gap-3 m-6 grid-cols-4 p-7 bg-black-300">
        <div className="col-span-4">
          <p className="font-medium text-orange-500">URL of the external data source page</p>
        </div>    
        <div className="col-span-3">
          <input
            type="text"
            id="user_url"
            className="bg-gray-50 border border-gray-300 text-gray-900 text-lg rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2.5 w-full"
            placeholder="Enter URL"
            onChange={handleUserUrlChange}
            value={userUrl}
          />
        </div>

        <div className="col-span-1">
          <input
            type="button"
            className="rounded-md bg-orange-500 py-3 px-4 text-black"
            value="Upload Data"
            onClick={fetchWebpageData}
          />
        </div>
      </div>
      <Stack
        direction="column"
        width={{ xs: "80%", sm: "70%", md: "40%", lg: "40%" }}
        height="600px"
        border="3px solid white"
        borderRadius={10}
        p={2}
        spacing={3}
        sx={{
          "@media (max-width)": {
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
              maxHeight={100}
              justifyContent={
                message.role === "assistant" ? "flex-start" : "flex-end"
              }
            >
              <Box
                //sx={style}
                backgroundColor={
                  message.role === "assistant" ? "black" : "orange"
                }
                color={message.role === "assistant" ? "yellow" : "black"}
                fontWeight={500}
                fontSize={message.role === "assistant" ? 18 : 16}
                borderRadius={6}
                padding={1.5} // Reduced the thickness or height of the box
                //maxWidth="80%"
                sx={{
                  "@media (max-width)": {
                    //padding: 1,
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
                sx={{ mt: 0.5, borderColor: 'white' }}
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
          >Send
          </IconButton>
        </Stack>
      </Stack>
    </Box>
    
  );
};
