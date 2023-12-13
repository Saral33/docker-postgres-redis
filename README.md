# Run this project

## Without Detached Mode

If you want to run the containers in terminal instead of background i.e not in detached mode. Then run

```bash
 docker-compose up --build
```

If you have already build and only want to start

```
docker-compose up
```

## WIth Detached Mode

If you want to run the containers in background, separate from your terminal session i.e in detached mode. Then run

```
docker-compose up --build -d
```

If you have already build and only want to start

```
docker-compose up -d
```
