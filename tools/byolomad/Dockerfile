ARG BASE_IMAGE=node:24-slim
FROM ${BASE_IMAGE}

RUN apt-get update && apt-get install -y --no-install-recommends \
        git curl ca-certificates bash coreutils findutils \
        python3 python3-pip python3-venv \
        build-essential jq \
    && rm -rf /var/lib/apt/lists/*

RUN npm install -g @anthropic-ai/claude-code @sourcegraph/amp @openai/codex

# Neutralize repo git hooks at the SYSTEM level (/etc/gitconfig). The runtime
# mounts the host ~/.gitconfig over /home/runner/.gitconfig (global scope), so
# a --global setting here would be shadowed; --system is not. /workspace/.git
# is a live host bind mount, so an agent that writes into .git/hooks could
# otherwise plant a hook that runs on the host at the next git operation —
# ignoring hooks inside the container removes the in-container trigger.
RUN git config --system core.hooksPath /dev/null

# Match host UID so files the container creates are owned by the host user.
ARG HOST_UID=1000
RUN useradd -m -s /bin/bash -u ${HOST_UID} runner
USER runner

# Optionally install Cursor's `agent` CLI for the cursor-reviews skill.
# Install as runner (the installer writes to ~/.local). Linux build is fetched
# at install time, matching the container architecture.
ARG WITH_CURSOR_AGENT=0
RUN if [ "$WITH_CURSOR_AGENT" = "1" ]; then \
      curl -fsSL https://cursor.com/install | bash; \
    fi
ENV PATH=/home/runner/.local/bin:${PATH}

WORKDIR /workspace
