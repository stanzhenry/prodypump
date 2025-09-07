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
// //           resolve(JSON.parse(body));
// //         } catch (error) {
// //           reject(error);
// //         }
// //       } else {
// //         resolve(null); // Resolve with null if there's no body
// //       }
// //     });
// //     req.on("error", (err) => {
// //       reject(err);
// //     });
// //   });
// // }

// // export default async function handler(req, res) {
// //   // ## THE FIX IS HERE ##
// //   // Destructure 'path' separately and use it if it exists.
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
// //     };

// //     if (requestBody) {
// //       options.body = JSON.stringify(requestBody);
// //     }

// //     const apiResponse = await fetch(targetUrl, options);

// //     res.status(apiResponse.status);
// //     apiResponse.headers.forEach((value, name) => {
// //       res.setHeader(name, value);
// //     });
// //     const body = await apiResponse.text();
// //     res.send(body);

// //   } catch (error) {
// //     console.error("Proxy error:", error);
// //     res.status(500).json({ error: "An error occurred in the proxy route.", message: error.message });
// //   }
// // }
//--good one //
// A helper function to parse the body from the raw request stream
// async function parseBody(req) {
//   // ... (This helper function remains the same as before)
//   return new Promise((resolve, reject) => {
//     let body = "";
//     req.on("data", (chunk) => {
//       body += chunk.toString();
//     });
//     req.on("end", () => {
//       if (body) {
//         try {
//           resolve(JSON.parse(body));
//         } catch (error) {
//           reject(error);
//         }
//       } else {
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
//   // Set the allowed origin. Use '*' for public access or your specific frontend domain for security.
//   res.setHeader('Access-Control-Allow-Origin', '*'); 
//   res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
//   res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

//   // ## PREFLIGHT REQUEST (OPTIONS) HANDLING ##
//   // The browser sends an OPTIONS request first to ask for permission.
//   // We need to respond with a 204 status code and the headers above.
//   if (req.method === 'OPTIONS') {
//     res.status(204).end();
//     return;
//   }

//   // Your existing proxy logic
//   let { slug = [], path, ...queryParams } = req.query;
//   const targetPath = path || slug.join("/");
//   const queryString = new URLSearchParams(queryParams).toString();
//   const targetUrl = `https://api-mainnet.mitosis.org/${targetPath}${
//     queryString ? `?${queryString}` : ""
//   }`;

//   console.log(`Forwarding request to: ${targetUrl}`);

//   try {
//     const requestBody = await parseBody(req);
//     const options = {
//       method: req.method,
//       headers: {
//         "Content-Type": req.headers["content-type"] || "application/json",
//         Authorization: req.headers.authorization || "",
//       },
//       // Vercel's fetch implementation requires this for streaming bodies
//       duplex: 'half' 
//     };

//     if (requestBody) {
//       options.body = JSON.stringify(requestBody);
//     }

//     const apiResponse = await fetch(targetUrl, options);

//     // Forward status code and headers from the target API
//     res.status(apiResponse.status);
//     // apiResponse.headers.forEach((value, name) => {
//     //   res.setHeader(name, value);
//     // });
//     // ## THE FIX IS HERE ##
//     // Forward headers, but remove content-encoding and content-length 
//     // as we are decompressing the body before sending it.
//     apiResponse.headers.forEach((value, name) => {
//       const lowerCaseName = name.toLowerCase();
//       if (lowerCaseName !== 'content-encoding' && lowerCaseName !== 'content-length') {
//         res.setHeader(name, value);
//       }
//     });
//     // Make sure our CORS headers are not overwritten
//     res.setHeader('Access-Control-Allow-Origin', '*');

//     const body = await apiResponse.text();
//     res.send(body);

//   } catch (error) {
//     console.error("Proxy error:", error);
//     res.status(500).json({ error: "An error occurred in the proxy route.", message: error.message });
//   }
// }

// A helper function to parse the body from the raw request stream
async function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk.toString();
    });
    req.on("end", () => {
      if (body) {
        try {
          // Attempt to parse the body as JSON
          resolve(JSON.parse(body));
        } catch (error) {
          // If parsing fails, it might not be JSON; reject the error
          reject(error);
        }
      } else {
        // Resolve with null if there is no body
        resolve(null);
      }
    });
    req.on("error", (err) => {
      reject(err);
    });
  });
}

export default async function handler(req, res) {
  // ## CORS HEADERS ##
  // Set headers to allow cross-origin requests
  res.setHeader('Access-Control-Allow-Origin', '*'); // Or your specific frontend domain
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // ## PREFLIGHT REQUEST (OPTIONS) HANDLING ##
  // Browsers send an OPTIONS request first to check CORS permissions
  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  // Destructure the request query to separate the path from other parameters
  const { slug = [], path, ...queryParams } = req.query;
  const targetPath = path || slug.join("/");

  // ## FIX FOR MULTIPLE QUERY PARAMETERS ##
  // Manually build the query string to correctly handle arrays.
  // This ensures that `?status=A&status=B` is preserved instead of becoming `?status=A,B`.
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(queryParams)) {
    if (Array.isArray(value)) {
      // If the value is an array, append each item separately for the same key
      value.forEach(item => params.append(key, item));
    } else {
      // Otherwise, just set the single value
      params.set(key, value);
    }
  }
  const queryString = params.toString();

  // Construct the full target URL to forward the request to
  const targetUrl = `https://api-mainnet.mitosis.org/${targetPath}${
    queryString ? `?${queryString}` : ""
  }`;

  console.log(`Forwarding request to: ${targetUrl}`);

  try {
    // Attempt to parse the incoming request body
    const requestBody = await parseBody(req).catch(() => null);

    // Prepare the options for the fetch request to the target API
    const options = {
      method: req.method,
      headers: {
        // Forward the original Content-Type and Authorization headers
        "Content-Type": req.headers["content-type"] || "application/json",
        Authorization: req.headers.authorization || "",
      },
      // This is required by Vercel's fetch implementation for requests with bodies
      duplex: 'half'
    };

    // If there was a body in the original request, stringify and add it
    if (requestBody) {
      options.body = JSON.stringify(requestBody);
    }

    // Make the request to the target API
    const apiResponse = await fetch(targetUrl, options);

    // ## FORWARD RESPONSE ##
    // Set the status code from the target API's response
    res.status(apiResponse.status);

    // Forward headers from the target API, but remove headers that can cause issues
    apiResponse.headers.forEach((value, name) => {
      const lowerCaseName = name.toLowerCase();
      if (lowerCaseName !== 'content-encoding' && lowerCaseName !== 'content-length') {
        res.setHeader(name, value);
      }
    });
    // Ensure our CORS header is not overwritten by the target API's headers
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Get the response body as text and send it back to the client
    const body = await apiResponse.text();
    res.send(body);

  } catch (error) {
    console.error("Proxy error:", error);
    res.status(500).json({ error: "An error occurred in the proxy route.", message: error.message });
  }
}
