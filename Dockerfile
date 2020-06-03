FROM python:3
LABEL MAINTAINER Bill Wu <a8508235@gmail.com>

COPY . /app

WORKDIR /app

RUN pip install -r requirements.txt

ENV PASSWORD redispassword
ENV HOST redis
ENV PORT 6379
ENV API_KEY YOUT_EBAY_API_KEY
CMD ["python3", "app.py"]