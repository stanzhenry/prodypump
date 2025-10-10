// // // // A helper function to parse the body from the raw request stream
// // // async function parseBody(req) {
// // //   return new Promise((resolve, reject) => {
// // //     let body = "";
// // //     req.on("data", (chunk) => {
// // //       body += chunk.toString();
// // //     });
// // //     req.on("end", () => {
// // //       if (body) {
// // //         try {
// // //           resolve(JSON.parse(body));
// // //         } catch (error) {
// // //           reject(error);
// // //         }
// // //       } else {
// // //         resolve(null); // Resolve with null if there's no body
// // //       }
// // //     });
// // //     req.on("error", (err) => {
// // //       reject(err);
// // //     });
// // //   });
// // // }

// // // export default async function handler(req, res) {
// // //   // ## THE FIX IS HERE ##
// // //   // Destructure 'path' separately and use it if it exists.
// // //   let { slug = [], path, ...queryParams } = req.query;
// // //   const targetPath = path || slug.join("/");

// // //   const queryString = new URLSearchParams(queryParams).toString();
// // //   const targetUrl = `https://api-mainnet.mitosis.org/${targetPath}${
// // //     queryString ? `?${queryString}` : ""
// // //   }`;

// // //   console.log(`Forwarding request to: ${targetUrl}`);

// // //   try {
// // //     const requestBody = await parseBody(req);

// // //     const options = {
// // //       method: req.method,
// // //       headers: {
// // //         "Content-Type": req.headers["content-type"] || "application/json",
// // //         Authorization: req.headers.authorization || "",
// // //       },
// // //     };

// // //     if (requestBody) {
// // //       options.body = JSON.stringify(requestBody);
// // //     }

// // //     const apiResponse = await fetch(targetUrl, options);

// // //     res.status(apiResponse.status);
// // //     apiResponse.headers.forEach((value, name) => {
// // //       res.setHeader(name, value);
// // //     });
// // //     const body = await apiResponse.text();
// // //     res.send(body);

// // //   } catch (error) {
// // //     console.error("Proxy error:", error);
// // //     res.status(500).json({ error: "An error occurred in the proxy route.", message: error.message });
// // //   }
// // // }
// //--good one //
// // A helper function to parse the body from the raw request stream
// // async function parseBody(req) {
// //   // ... (This helper function remains the same as before)
// //   return new Promise((resolve, reject) => {
// //     let body = "";
// //     req.on("data", (chunk) => {
// //       body += chunk.toString();
// //     });
// //     req.on("end", () => {
// //       if (body) {
// //         try {
// //           resolve(JSON.parse(body));
// //         } catch (error) {
// //           reject(error);
// //         }
// //       } else {
// //         resolve(null);
// //       }
// //     });
// //     req.on("error", (err) => {
// //       reject(err);
// //     });
// //   });
// // }

// // export default async function handler(req, res) {
// //   // ## CORS HEADERS ##
// //   // Set the allowed origin. Use '*' for public access or your specific frontend domain for security.
// //   res.setHeader('Access-Control-Allow-Origin', '*'); 
// //   res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
// //   res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

// //   // ## PREFLIGHT REQUEST (OPTIONS) HANDLING ##
// //   // The browser sends an OPTIONS request first to ask for permission.
// //   // We need to respond with a 204 status code and the headers above.
// //   if (req.method === 'OPTIONS') {
// //     res.status(204).end();
// //     return;
// //   }

// //   // Your existing proxy logic
// //   let { slug = [], path, ...queryParams } = req.query;
// //   const targetPath = path || slug.join("/");
// //   const queryString = new URLSearchParams(queryParams).toString();
// //   const targetUrl = `https://api-mainnet.mitosis.org/${targetPath}${
// //     queryString ? `?${queryString}` : ""
// //   }`;

// //   console.log(`Forwarding request to: ${targetUrl}`);

// //   try {
// //     const requestBody = await parseBody(req);
// //     const options = {
// //       method: req.method,
// //       headers: {
// //         "Content-Type": req.headers["content-type"] || "application/json",
// //         Authorization: req.headers.authorization || "",
// //       },
// //       // Vercel's fetch implementation requires this for streaming bodies
// //       duplex: 'half' 
// //     };

// //     if (requestBody) {
// //       options.body = JSON.stringify(requestBody);
// //     }

// //     const apiResponse = await fetch(targetUrl, options);

// //     // Forward status code and headers from the target API
// //     res.status(apiResponse.status);
// //     // apiResponse.headers.forEach((value, name) => {
// //     //   res.setHeader(name, value);
// //     // });
// //     // ## THE FIX IS HERE ##
// //     // Forward headers, but remove content-encoding and content-length 
// //     // as we are decompressing the body before sending it.
// //     apiResponse.headers.forEach((value, name) => {
// //       const lowerCaseName = name.toLowerCase();
// //       if (lowerCaseName !== 'content-encoding' && lowerCaseName !== 'content-length') {
// //         res.setHeader(name, value);
// //       }
// //     });
// //     // Make sure our CORS headers are not overwritten
// //     res.setHeader('Access-Control-Allow-Origin', '*');

// //     const body = await apiResponse.text();
// //     res.send(body);

// //   } catch (error) {
// //     console.error("Proxy error:", error);
// //     res.status(500).json({ error: "An error occurred in the proxy route.", message: error.message });
// //   }
// // }

// // // A helper function to parse the body from the raw request stream
// // async function parseBody(req) {
// //   return new Promise((resolve, reject) => {
// //     let body = "";
// //     req.on("data", (chunk) => {
// //       body += chunk.toString();
// //     });
// //     req.on("end", () => {
// //       if (body) {
// //         try {
// //           // Attempt to parse the body as JSON
// //           resolve(JSON.parse(body));
// //         } catch (error) {
// //           // If parsing fails, it might not be JSON; reject the error
// //           reject(error);
// //         }
// //       } else {
// //         // Resolve with null if there is no body
// //         resolve(null);
// //       }
// //     });
// //     req.on("error", (err) => {
// //       reject(err);
// //     });
// //   });
// // }

// // export default async function handler(req, res) {
// //   // ## CORS HEADERS ##
// //   // Set headers to allow cross-origin requests
// //   res.setHeader('Access-Control-Allow-Origin', '*'); // Or your specific frontend domain
// //   res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
// //   res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

// //   // ## PREFLIGHT REQUEST (OPTIONS) HANDLING ##
// //   // Browsers send an OPTIONS request first to check CORS permissions
// //   if (req.method === 'OPTIONS') {
// //     res.status(204).end();
// //     return;
// //   }

// //   // Destructure the request query to separate the path from other parameters
// //   const { slug = [], path, ...queryParams } = req.query;
// //   const targetPath = path || slug.join("/");

// //   // ## FIX FOR MULTIPLE QUERY PARAMETERS ##
// //   // Manually build the query string to correctly handle arrays.
// //   // This ensures that `?status=A&status=B` is preserved instead of becoming `?status=A,B`.
// //   const params = new URLSearchParams();
// //   for (const [key, value] of Object.entries(queryParams)) {
// //     if (Array.isArray(value)) {
// //       // If the value is an array, append each item separately for the same key
// //       value.forEach(item => params.append(key, item));
// //     } else {
// //       // Otherwise, just set the single value
// //       params.set(key, value);
// //     }
// //   }
// //   const queryString = params.toString();

// //   // Construct the full target URL to forward the request to
// //   const targetUrl = `https://solpump.io/api/${targetPath}${
// //     queryString ? `?${queryString}` : ""
// //   }`;

// //   console.log(`Forwarding request to: ${targetUrl}`);

// //   try {
// //     // Attempt to parse the incoming request body
// //     const requestBody = await parseBody(req).catch(() => null);

// //     // Prepare the options for the fetch request to the target API
// //     const options = {
// //       method: req.method,
// //       headers: {
// //         // Forward the original Content-Type and Authorization headers
// //         "Content-Type": req.headers["content-type"] || "application/json",
// //         Authorization: req.headers.authorization || "",
// //       },
// //       // This is required by Vercel's fetch implementation for requests with bodies
// //       duplex: 'half'
// //     };

// //     // If there was a body in the original request, stringify and add it
// //     if (requestBody) {
// //       options.body = JSON.stringify(requestBody);
// //     }

// //     // Make the request to the target API
// //     const apiResponse = await fetch(targetUrl, options);

// //     // ## FORWARD RESPONSE ##
// //     // Set the status code from the target API's response
// //     res.status(apiResponse.status);

// //     // Forward headers from the target API, but remove headers that can cause issues
// //     apiResponse.headers.forEach((value, name) => {
// //       const lowerCaseName = name.toLowerCase();
// //       if (lowerCaseName !== 'content-encoding' && lowerCaseName !== 'content-length') {
// //         res.setHeader(name, value);
// //       }
// //     });
// //     // Ensure our CORS header is not overwritten by the target API's headers
// //     res.setHeader('Access-Control-Allow-Origin', '*');

// //     // Get the response body as text and send it back to the client
// //     const body = await apiResponse.text();
// //     res.send(body);

// //   } catch (error) {
// //     console.error("Proxy error:", error);
// //     res.status(500).json({ error: "An error occurred in the proxy route.", message: error.message });
// //   }
// // }
// // A helper function to parse the body from the raw request stream
// async function parseBody(req) {
//   return new Promise((resolve, reject) => {
//     let body = "";
//     req.on("data", (chunk) => {
//       body += chunk.toString();
//     });
//     req.on("end", () => {
//       if (body) {
//         try {
//           // Attempt to parse the body as JSON
//           resolve(JSON.parse(body));
//         } catch (error) {
//           // If parsing fails, it might not be JSON; reject the error
//           reject(error);
//         }
//       } else {
//         // Resolve with null if there is no body
//         resolve(null);
//       }
//     });
//     req.on("error", (err) => {
//       reject(err);
//     });
//   });
// }

// export default async function handler(req, res) {
//   // ## CORS HEADERS ##
//   // Set headers to allow cross-origin requests
//   res.setHeader('Access-Control-Allow-Origin', '*'); // Or your specific frontend domain
//   res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
//   res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

//   // ## PREFLIGHT REQUEST (OPTIONS) HANDLING ##
//   // Browsers send an OPTIONS request first to check CORS permissions
//   if (req.method === 'OPTIONS') {
//     res.status(204).end();
//     return;
//   }

//   // Destructure the request query to separate the path from other parameters
//   const { slug = [], path, ...queryParams } = req.query;
//   const targetPath = path || slug.join("/");

//   // ## FIX FOR MULTIPLE QUERY PARAMETERS ##
//   // Manually build the query string to correctly handle arrays.
//   // This ensures that `?status=A&status=B` is preserved instead of becoming `?status=A,B`.
//   const params = new URLSearchParams();
//   for (const [key, value] of Object.entries(queryParams)) {
//     if (Array.isArray(value)) {
//       // If the value is an array, append each item separately for the same key
//       value.forEach(item => params.append(key, item));
//     } else {
//       // Otherwise, just set the single value
//       params.set(key, value);
//     }
//   }
//   const queryString = params.toString();

//   // Construct the full target URL to forward the request to
//   const targetUrl = `https://solpump.io/api/${targetPath}${
//     queryString ? `?${queryString}` : ""
//   }`;

//   console.log(`Forwarding request to: ${targetUrl}`);

//   try {
//     // Attempt to parse the incoming request body
//     const requestBody = await parseBody(req).catch(() => null);

//     // Prepare the options for the fetch request to the target API
//     const options = {
//       method: req.method,
//       headers: {
//         // Set Host and Origin to solpump.com as required by the API
//         "Host": "solpump.com",
//         "Origin": "https://solpump.com",
//         // Forward the original Content-Type and Authorization headers
//         "Content-Type": req.headers["content-type"] || "application/json",
//         "Authorization": req.headers.authorization || "",
//         // Forward other relevant headers
//         "User-Agent": req.headers["user-agent"] || "",
//         "Accept": req.headers["accept"] || "*/*",
//         "Accept-Language": req.headers["accept-language"] || "",
//         "Accept-Encoding": req.headers["accept-encoding"] || "",
//       },
//       // This is required by Vercel's fetch implementation for requests with bodies
//       duplex: 'half'
//     };

//     // If there was a body in the original request, stringify and add it
//     if (requestBody) {
//       options.body = JSON.stringify(requestBody);
//     }

//     // Make the request to the target API
//     const apiResponse = await fetch(targetUrl, options);

//     // ## FORWARD RESPONSE ##
//     // Set the status code from the target API's response
//     res.status(apiResponse.status);

//     // Forward headers from the target API, but remove headers that can cause issues
//     apiResponse.headers.forEach((value, name) => {
//       const lowerCaseName = name.toLowerCase();
//       // Skip problematic headers and the original Host/Origin headers
//       if (!['content-encoding', 'content-length', 'host', 'origin'].includes(lowerCaseName)) {
//         res.setHeader(name, value);
//       }
//     });
//     // Ensure our CORS header is not overwritten by the target API's headers
//     res.setHeader('Access-Control-Allow-Origin', '*');

//     // Get the response body as text and send it back to the client
//     const body = await apiResponse.text();
//     res.send(body);

//   } catch (error) {
//     console.error("Proxy error:", error);
//     res.status(500).json({ error: "An error occurred in the proxy route.", message: error.message });
//   }
// }

// pages/api/proxy.js  (or any Next.js API route file)
import http2 from "http2";

// Helper to read request body (same as your original parseBody)
async function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => (body += chunk.toString()));
    req.on("end", () => {
      if (!body) return resolve(null);
      // Try JSON, otherwise return raw string
      try {
        resolve(JSON.parse(body));
      } catch (err) {
        resolve(body);
      }
    });
    req.on("error", reject);
  });
}

export default async function handler(req, res) {
  // CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    res.status(204).end();
    return;
  }

  // Build target path: reuse your slug/path logic if you like
  const { slug = [], path, ...queryParams } = req.query;
  const targetPath = path || (Array.isArray(slug) ? slug.join("/") : slug);

  // Build querystring (preserve repeated keys)
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(queryParams || {})) {
    if (Array.isArray(v)) v.forEach(item => params.append(k, item));
    else params.set(k, v);
  }
  const queryString = params.toString();
  const fullPath = `/api/${targetPath}${queryString ? `?${queryString}` : ""}`;

  // Collect request body (if any)
  let requestBody = null;
  try {
    requestBody = await parseBody(req);
  } catch (err) {
    // fallback to null body if parse fails
    requestBody = null;
  }

  // Create HTTP/2 client
  const targetOrigin = "https://solpump.io";
  const client = http2.connect(targetOrigin);

  client.on("error", (err) => {
    console.error("HTTP/2 client error:", err);
  });

  // Build headers including HTTP/2 pseudo-headers
  const outgoingHeaders = {
    // HTTP/2 pseudo-headers
    ":method": req.method,
    ":path": fullPath,
    ":scheme": "https",
    ":authority": "solpump.io",

    // Useful forwarded headers (override or supply defaults)
    accept: req.headers.accept || "application/json, text/plain, */*",
    "accept-encoding": req.headers["accept-encoding"] || "gzip, deflate, br, zstd",
    "accept-language": req.headers["accept-language"] || "en-US,en;q=0.9",
    pragma: req.headers.pragma || "no-cache",
    referer: req.headers.referer || "https://solpump.io/",
    "sec-ch-ua": req.headers["sec-ch-ua"] || '"Not?A_Brand";v="8", "Chromium";v="141"',
    "sec-ch-ua-mobile": req.headers["sec-ch-ua-mobile"] || "?0",
    "sec-ch-ua-platform": req.headers["sec-ch-ua-platform"] || '"Windows"',
    "sec-fetch-dest": req.headers["sec-fetch-dest"] || "empty",
    "sec-fetch-mode": req.headers["sec-fetch-mode"] || "cors",
    "sec-fetch-site": req.headers["sec-fetch-site"] || "same-origin",
    "user-agent": req.headers["user-agent"] || "node-http2-client",
    cookie: req.headers.cookie || "",

    // carry through authorization if provided
    authorization: req.headers.authorization || "",

    // Content-Type when there is a body
    ...(requestBody ? { "content-type": req.headers["content-type"] || "application/json" } : {}),
  };

  // Create the request (HTTP/2)
  const proxyReq = client.request(outgoingHeaders, { endStream: false });

  proxyReq.on("response", (headers) => {
    // Convert http2 headers to normal headers and set on response
    // headers may contain :status pseudo-header
    const status = headers[":status"] || 200;

    // Remove hop-by-hop or undesirable headers
    const forbidden = new Set([
      "content-encoding",
      "transfer-encoding",
      "connection",
      "keep-alive",
      "proxy-authenticate",
      "proxy-authorization",
      "te",
      "trailer",
      "upgrade",
    ]);

    Object.entries(headers).forEach(([name, value]) => {
      if (name.startsWith(":")) return; // skip pseudo-headers
      // Some header values are arrays
      const headerName = name;
      if (!forbidden.has(headerName.toLowerCase())) {
        try {
          res.setHeader(headerName, value);
        } catch (e) {
          // ignore header set errors
        }
      }
    });

    // Re-apply our CORS header to avoid overwrite
    res.setHeader("Access-Control-Allow-Origin", "*");

    res.status(Number(status));
  });

  // Collect body chunks from upstream and send them back to client
  let respData = [];
  proxyReq.on("data", (chunk) => respData.push(chunk));
  proxyReq.on("end", () => {
    const buffer = Buffer.concat(respData);
    // attempt to decode as utf8 string
    const text = buffer.toString("utf8");
    res.send(text);
    client.close();
  });

  proxyReq.on("error", (err) => {
    console.error("Proxy request error:", err);
    try {
      res.status(502).json({ error: "Upstream request error", message: err.message });
    } catch (e) {
      // ignore
    }
    client.close();
  });

  // If there's a body, write it
  if (requestBody) {
    // If requestBody is an object (parsed JSON), stringify
    const payload = typeof requestBody === "string" ? requestBody : JSON.stringify(requestBody);
    proxyReq.write(payload);
  }

  // End the request
  proxyReq.end();
}
