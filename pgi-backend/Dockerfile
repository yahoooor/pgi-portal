FROM python:3.10-slim-buster AS builder

RUN python -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

COPY requirements.txt .
RUN python -m pip install -r requirements.txt


FROM python:3.10-slim-buster AS runner

COPY --from=builder /opt/venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

COPY main.py /app/
COPY entrypoint.sh /app/
COPY src /app/src

WORKDIR /app

ENTRYPOINT ["bash", "entrypoint.sh"]
