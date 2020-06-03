# eBay Shopping item filter

Demo web app for using flask as backend, vanilla js as frontend

Use Redis to cache query result with ttl(5 minutes), and store last three query

## Getting Started

Replace API_KEY in `Dockerfile` with your eBay API key 

### Installing

After adding API_KEY, RUN

```
docker-compose -d
```

And then check your `http://localhost:5000/`