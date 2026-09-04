FROM jenkins/jenkins:lts-jdk17

USER root

RUN apt-get update && \
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && \
    apt-get install -y nodejs && \
    npm install -g vercel && \
    rm -rf /var/lib/apt/lists/*

USER jenkins