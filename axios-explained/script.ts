import axios, { AxiosResponse } from "axios";

axios.defaults.headers.common["x-auth-token"] = "token";

const addToPrettier = (
  element: HTMLElement,
  data: { [key: string]: any },
  indentation: number = 2
) => {
  element.innerHTML = JSON.stringify(data, null, indentation);
};

axios.interceptors.request.use(
  config => {
    console.info(
      `${config.method!.toUpperCase()} request sent to ${
        config!.url
      } at ${new Date().getTime()}`
    );
    return config;
  },
  err => Promise.reject(err)
);

axios.interceptors.response.use(res => res, err => Promise.reject(err));

const displayResponse = ({ status, headers, data, config }: AxiosResponse) => {
  document.getElementById("status")!.innerHTML = `Status: ${status}`;
  addToPrettier(document.getElementById("headers")!, headers);
  addToPrettier(document.getElementById("data")!, data);
  addToPrettier(document.getElementById("config")!, config);
};

document.getElementById("get")!.addEventListener("click", async () => {
  const res = await axios("https://jsonplaceholder.typicode.com/todos", {
    params: { _limit: 5 }
  });

  displayResponse(res);
});

document.getElementById("post")!.addEventListener("click", async () => {
  const res = await axios.post(
    "https://jsonplaceholder.typicode.com/todos",
    {
      title: "newTodo",
      completed: false
    },
    { timeout: 5000 }
  );

  displayResponse(res);
});

document.getElementById("patch")!.addEventListener("click", async () => {
  const res = await axios.patch(
    "https://jsonplaceholder.typicode.com/todos/1",
    {
      completed: true
    }
  );

  displayResponse(res);
});

document.getElementById("put")!.addEventListener("click", async () => {
  const res = await axios.put("https://jsonplaceholder.typicode.com/todos/1", {
    completed: true
  });

  displayResponse(res);
});

document.getElementById("delete")!.addEventListener("click", async () => {
  const res = await axios.delete(
    "https://jsonplaceholder.typicode.com/todos/1"
  );

  displayResponse(res);
});

document.getElementById("all")!.addEventListener("click", () => {
  axios
    .all([
      axios("https://jsonplaceholder.typicode.com/todos", {
        headers: { "Content-Type": "application/json", authorization: "token" },
        params: { _limit: 5 }
      }),
      axios.post(
        "https://jsonplaceholder.typicode.com/todos",
        {
          title: "newTodo",
          completed: false
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: "token"
          }
        }
      )
    ])
    .then(
      axios.spread((getTodoResponse, postTodoResponse) => {
        displayResponse(getTodoResponse);
      })
    );
});

document.getElementById("transform")!.addEventListener("click", async () => {
  const res = await axios.post(
    "https://jsonplaceholder.typicode.com/todos",
    { title: "transform me to uppercase" },
    {
      transformResponse:
        axios.defaults.transformResponse &&
        Array.isArray(axios.defaults.transformResponse)
          ? axios.defaults.transformResponse.concat(data => {
              data.title = data.title.toUpperCase();
              return data;
            })
          : undefined
    }
  );

  displayResponse(res);
});

document.getElementById("error")!.addEventListener("click", () => {
  axios
    .get("https://jsonplaceholder.typicode.com/todoss", {
      validateStatus: status => {
        // reject just if status is less or equal to 500
        return status > 500;
      }
    })
    .catch(err => {
      // Server responded with a status other than 200 range
      if (err.response) {
        console.log(err.response);
      }
      console.log(err.request);
      console.log(err.message);
    });
});

document.getElementById("cancel")!.addEventListener("click", () => {
  const source = axios.CancelToken.source();

  axios("https://jsonplaceholder.typicode.com/todos", {
    params: { _limit: 5 },
    cancelToken: source.token
  })
    .then(res => displayResponse(res))
    .catch(err => {
      if (axios.isCancel(err)) {
        console.log("Request was canceled", err.message);
      }
    });

  if (true) {
    source.cancel("request canceled!");
  }
});

document.getElementById("instance")!.addEventListener("click", async () => {
  const axiosInstance = axios.create({
    // custom settings
    baseURL: "https://jsonplaceholder.typicode.com"
  });

  const res = await axiosInstance("/comments", { params: { _limit: 5 } });

  displayResponse(res);
});
