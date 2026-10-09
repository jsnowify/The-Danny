# The Danny — Stage A complete changed files

Every changed or new authored file for Stage A is reproduced in full below. SOURCE.md is the separate generated full-project bundle.

## package.json

~~~~json
{
  "name": "the-danny",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite --host 0.0.0.0",
    "build": "tsc -b && vite build",
    "preview": "vite preview --host 0.0.0.0",
    "test": "playwright test",
    "format": "prettier --write src tests scripts *.ts *.json index.html"
  },
  "dependencies": {
    "@fontsource/instrument-serif": "^5.3.0",
    "@react-three/drei": "9.122.0",
    "@react-three/fiber": "8.18.0",
    "@react-three/postprocessing": "2.19.1",
    "maath": "0.10.8",
    "react": "18.3.1",
    "react-dom": "18.3.1",
    "three": "0.170.0",
    "tone": "15.1.22",
    "zustand": "5.0.8"
  },
  "devDependencies": {
    "@playwright/test": "^1.56.0",
    "@types/react": "^18.3.18",
    "@types/react-dom": "^18.3.5",
    "@types/three": "^0.170.0",
    "@vitejs/plugin-react": "^4.4.1",
    "leva": "0.10.0",
    "prettier": "^3.9.9",
    "typescript": "^5.7.3",
    "vite": "^6.4.1"
  }
}
~~~~

## package-lock.json

~~~~json
{
  "name": "the-danny",
  "version": "1.0.0",
  "lockfileVersion": 3,
  "requires": true,
  "packages": {
    "": {
      "name": "the-danny",
      "version": "1.0.0",
      "dependencies": {
        "@fontsource/instrument-serif": "^5.3.0",
        "@react-three/drei": "9.122.0",
        "@react-three/fiber": "8.18.0",
        "@react-three/postprocessing": "2.19.1",
        "maath": "0.10.8",
        "react": "18.3.1",
        "react-dom": "18.3.1",
        "three": "0.170.0",
        "tone": "15.1.22",
        "zustand": "5.0.8"
      },
      "devDependencies": {
        "@playwright/test": "^1.56.0",
        "@types/react": "^18.3.18",
        "@types/react-dom": "^18.3.5",
        "@types/three": "^0.170.0",
        "@vitejs/plugin-react": "^4.4.1",
        "leva": "0.10.0",
        "prettier": "^3.9.9",
        "typescript": "^5.7.3",
        "vite": "^6.4.1"
      }
    },
    "node_modules/@babel/code-frame": {
      "version": "7.29.7",
      "resolved": "https://registry.npmjs.org/@babel/code-frame/-/code-frame-7.29.7.tgz",
      "integrity": "sha512-Aup7aUOfpbAUg2ROOJN6Iw5f9DMBlzu0mIkm/malLQFN/YQgO48wCj0Kxa3sEHJvPVFg7siR+qRInwXd2qhQKw==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@babel/helper-validator-identifier": "^7.29.7",
        "js-tokens": "^4.0.0",
        "picocolors": "^1.1.1"
      },
      "engines": {
        "node": ">=6.9.0"
      }
    },
    "node_modules/@babel/compat-data": {
      "version": "7.29.7",
      "resolved": "https://registry.npmjs.org/@babel/compat-data/-/compat-data-7.29.7.tgz",
      "integrity": "sha512-locTkQyKvwIEgBzVrn8693ebc97F2U8ZHjbXwDXJ5Fn2TCpNwTlKcaKLkdHop5c/icOFE7qt7Q9JC5hnKNa6Gg==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=6.9.0"
      }
    },
    "node_modules/@babel/core": {
      "version": "7.29.7",
      "resolved": "https://registry.npmjs.org/@babel/core/-/core-7.29.7.tgz",
      "integrity": "sha512-RgHBCvtjbOK2gXSNBNIkNoEc9qoVEtau3hj8gEqKQuL3HZAibKarWFEI3Lfm6EYKkLalOh8eSrj9b+ch9H/VBA==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@babel/code-frame": "^7.29.7",
        "@babel/generator": "^7.29.7",
        "@babel/helper-compilation-targets": "^7.29.7",
        "@babel/helper-module-transforms": "^7.29.7",
        "@babel/helpers": "^7.29.7",
        "@babel/parser": "^7.29.7",
        "@babel/template": "^7.29.7",
        "@babel/traverse": "^7.29.7",
        "@babel/types": "^7.29.7",
        "@jridgewell/remapping": "^2.3.5",
        "convert-source-map": "^2.0.0",
        "debug": "^4.1.0",
        "gensync": "^1.0.0-beta.2",
        "json5": "^2.2.3",
        "semver": "^6.3.1"
      },
      "engines": {
        "node": ">=6.9.0"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/babel"
      }
    },
    "node_modules/@babel/generator": {
      "version": "7.29.8",
      "resolved": "https://registry.npmjs.org/@babel/generator/-/generator-7.29.8.tgz",
      "integrity": "sha512-gZbepsdh3WDtgZKWL+vTPh71LSBrm/Y4/QDZBVCcYfmeTEEuoOYwlSy+G1StfJg+/Zy550u/3TATbm7qDbbMtg==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@babel/parser": "^7.29.8",
        "@babel/types": "^7.29.8",
        "@jridgewell/gen-mapping": "^0.3.12",
        "@jridgewell/trace-mapping": "^0.3.28",
        "jsesc": "^3.0.2"
      },
      "engines": {
        "node": ">=6.9.0"
      }
    },
    "node_modules/@babel/helper-compilation-targets": {
      "version": "7.29.7",
      "resolved": "https://registry.npmjs.org/@babel/helper-compilation-targets/-/helper-compilation-targets-7.29.7.tgz",
      "integrity": "sha512-wem6WaBj4NaVYVdNhLPPVacES6ZJ+KBBfSkTMD3YZxbP3rm3Di85tJU5ljaUNhaOynt+Aj0xruhYuzQBt8n71g==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@babel/compat-data": "^7.29.7",
        "@babel/helper-validator-option": "^7.29.7",
        "browserslist": "^4.24.0",
        "lru-cache": "^5.1.1",
        "semver": "^6.3.1"
      },
      "engines": {
        "node": ">=6.9.0"
      }
    },
    "node_modules/@babel/helper-globals": {
      "version": "7.29.7",
      "resolved": "https://registry.npmjs.org/@babel/helper-globals/-/helper-globals-7.29.7.tgz",
      "integrity": "sha512-3nQVUAtvkKH9zahfWgw96Jc/uFOmjACE1kQz82E2lqWmHBgjzbNlsC22nuQTfahmWeQtTq5nQ/4Nnd2A1wj4zA==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=6.9.0"
      }
    },
    "node_modules/@babel/helper-module-imports": {
      "version": "7.29.7",
      "resolved": "https://registry.npmjs.org/@babel/helper-module-imports/-/helper-module-imports-7.29.7.tgz",
      "integrity": "sha512-ejHwrQQYcm9xnTivShn2IDOlIzInN34AXskvq9QicvCtEzq1Vzclu/tKF8Jq1Cg8JG2GL6/EmjgsCT7lXepE3g==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@babel/traverse": "^7.29.7",
        "@babel/types": "^7.29.7"
      },
      "engines": {
        "node": ">=6.9.0"
      }
    },
    "node_modules/@babel/helper-module-transforms": {
      "version": "7.29.7",
      "resolved": "https://registry.npmjs.org/@babel/helper-module-transforms/-/helper-module-transforms-7.29.7.tgz",
      "integrity": "sha512-UPUVSyXbOh627KiCIGQSgwWzGeBKLkaJ9PJEdrngIwMSzxLR4jS4+f1f1jb7VzBbg8nFLaYotvVPFCTqdrmTAg==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@babel/helper-module-imports": "^7.29.7",
        "@babel/helper-validator-identifier": "^7.29.7",
        "@babel/traverse": "^7.29.7"
      },
      "engines": {
        "node": ">=6.9.0"
      },
      "peerDependencies": {
        "@babel/core": "^7.0.0"
      }
    },
    "node_modules/@babel/helper-plugin-utils": {
      "version": "7.29.7",
      "resolved": "https://registry.npmjs.org/@babel/helper-plugin-utils/-/helper-plugin-utils-7.29.7.tgz",
      "integrity": "sha512-G7sHYigPY17oO5SYWnfD/0MTBwVR781S/JI643e/JhUYgVgWE/61SoW3NH9KWUKyKq5LVh3npif99Wkt6j86Jw==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=6.9.0"
      }
    },
    "node_modules/@babel/helper-string-parser": {
      "version": "7.29.7",
      "resolved": "https://registry.npmjs.org/@babel/helper-string-parser/-/helper-string-parser-7.29.7.tgz",
      "integrity": "sha512-Pb5ijPrZ89GDH8223L4UP8i6QApWxs04RbPQJTeWDV0/keR2E36MeKnyr6LYmUUvqRRI+Iv87SuF1W6ErINzYw==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=6.9.0"
      }
    },
    "node_modules/@babel/helper-validator-identifier": {
      "version": "7.29.7",
      "resolved": "https://registry.npmjs.org/@babel/helper-validator-identifier/-/helper-validator-identifier-7.29.7.tgz",
      "integrity": "sha512-qehxGkRj55h/ff8EMaJ+cYhyaKlHIxqYDn682wQD7RNp9UujOQsHog2uS0r2vzr4pW+sXf90NeeayjcNaX3fFg==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=6.9.0"
      }
    },
    "node_modules/@babel/helper-validator-option": {
      "version": "7.29.7",
      "resolved": "https://registry.npmjs.org/@babel/helper-validator-option/-/helper-validator-option-7.29.7.tgz",
      "integrity": "sha512-N9ZErrD+yW5geCDtBqnOoxmR8+tNKiGuxKlDpuJxfsqpa2dFcexaziGAE/qoHLiDDreVNMupxGmSoNlyvsA3gw==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=6.9.0"
      }
    },
    "node_modules/@babel/helpers": {
      "version": "7.29.10",
      "resolved": "https://registry.npmjs.org/@babel/helpers/-/helpers-7.29.10.tgz",
      "integrity": "sha512-EMCx3AGZ3WfAl6ht7AyQoPm2Lh+BGYEMdc4Q6Hf7uSCDOZFuLq44qNwL+iaim8VlyYhRAo4X43+weadK8ZB4Yg==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@babel/template": "^7.29.7",
        "@babel/types": "^7.29.8"
      },
      "engines": {
        "node": ">=6.9.0"
      }
    },
    "node_modules/@babel/parser": {
      "version": "7.29.9",
      "resolved": "https://registry.npmjs.org/@babel/parser/-/parser-7.29.9.tgz",
      "integrity": "sha512-CjXrNHTnvqBVqHgdBysY3vk2T8tpJHb5/RMeHJBTyVa9xgugCB0CJTx/3oO8RV2QRQP391RWpB7D6hLjm8V9uA==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@babel/types": "^7.29.8"
      },
      "bin": {
        "parser": "bin/babel-parser.js"
      },
      "engines": {
        "node": ">=6.0.0"
      }
    },
    "node_modules/@babel/plugin-transform-react-jsx-self": {
      "version": "7.29.7",
      "resolved": "https://registry.npmjs.org/@babel/plugin-transform-react-jsx-self/-/plugin-transform-react-jsx-self-7.29.7.tgz",
      "integrity": "sha512-TL0hMc9xzy86VD31nUiwzd5otRAcyEPcsegCxolO0PvcXuH1v0kECe/UIznYFihpkvU5wg/jk4v0TTEFfm53fw==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@babel/helper-plugin-utils": "^7.29.7"
      },
      "engines": {
        "node": ">=6.9.0"
      },
      "peerDependencies": {
        "@babel/core": "^7.0.0-0"
      }
    },
    "node_modules/@babel/plugin-transform-react-jsx-source": {
      "version": "7.29.7",
      "resolved": "https://registry.npmjs.org/@babel/plugin-transform-react-jsx-source/-/plugin-transform-react-jsx-source-7.29.7.tgz",
      "integrity": "sha512-06IyK09H3wi4cGbhDBwp5gUGo0IKtnYa8tyTiephirPCK6fbobVGiXMMI5zLQ4aKEYP3wZ3ArU44o+8KMrSG/Q==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@babel/helper-plugin-utils": "^7.29.7"
      },
      "engines": {
        "node": ">=6.9.0"
      },
      "peerDependencies": {
        "@babel/core": "^7.0.0-0"
      }
    },
    "node_modules/@babel/runtime": {
      "version": "7.29.10",
      "resolved": "https://registry.npmjs.org/@babel/runtime/-/runtime-7.29.10.tgz",
      "integrity": "sha512-NpugTzbKgGrNe45Ui32cN8vCFFMxVtP/9rtfwv0nP5FRDAjvYBxJcLVpYA9mr1jxP6cnIT7x9LUzuDTbWYYNRA==",
      "license": "MIT",
      "engines": {
        "node": ">=6.9.0"
      }
    },
    "node_modules/@babel/template": {
      "version": "7.29.7",
      "resolved": "https://registry.npmjs.org/@babel/template/-/template-7.29.7.tgz",
      "integrity": "sha512-puq+Gf35oI24FeN11LkoUQFqv9uwNeWpxXZi/Ji3rRIoKAzKnxRaZ+Gkj0vKS9ZCiTESfng1N9LyOyXvo+m+Gg==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@babel/code-frame": "^7.29.7",
        "@babel/parser": "^7.29.7",
        "@babel/types": "^7.29.7"
      },
      "engines": {
        "node": ">=6.9.0"
      }
    },
    "node_modules/@babel/traverse": {
      "version": "7.29.10",
      "resolved": "https://registry.npmjs.org/@babel/traverse/-/traverse-7.29.10.tgz",
      "integrity": "sha512-B3lYAs2nkKskbgQ1nfy8Ma9ao9Q1rntTAQHrzzyDuj+TSO+X3le6PfWwqDvodsb+OumE10eMFfuMCTQSQ5iuIQ==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@babel/code-frame": "^7.29.7",
        "@babel/generator": "^7.29.8",
        "@babel/helper-globals": "^7.29.7",
        "@babel/parser": "^7.29.9",
        "@babel/template": "^7.29.7",
        "@babel/types": "^7.29.8",
        "debug": "^4.3.1"
      },
      "engines": {
        "node": ">=6.9.0"
      }
    },
    "node_modules/@babel/types": {
      "version": "7.29.8",
      "resolved": "https://registry.npmjs.org/@babel/types/-/types-7.29.8.tgz",
      "integrity": "sha512-Vj1jF3cPfxg7OAfoI7QnVKLoILlm2JF9pnVHrX8qx7AHMiYWT+NDAA7jChlNgRS4WTLc/fD1lXLmPixluj+3Gg==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@babel/helper-string-parser": "^7.29.7",
        "@babel/helper-validator-identifier": "^7.29.7"
      },
      "engines": {
        "node": ">=6.9.0"
      }
    },
    "node_modules/@esbuild/aix-ppc64": {
      "version": "0.25.12",
      "resolved": "https://registry.npmjs.org/@esbuild/aix-ppc64/-/aix-ppc64-0.25.12.tgz",
      "integrity": "sha512-Hhmwd6CInZ3dwpuGTF8fJG6yoWmsToE+vYgD4nytZVxcu1ulHpUQRAB1UJ8+N1Am3Mz4+xOByoQoSZf4D+CpkA==",
      "cpu": [
        "ppc64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "aix"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/@esbuild/android-arm": {
      "version": "0.25.12",
      "resolved": "https://registry.npmjs.org/@esbuild/android-arm/-/android-arm-0.25.12.tgz",
      "integrity": "sha512-VJ+sKvNA/GE7Ccacc9Cha7bpS8nyzVv0jdVgwNDaR4gDMC/2TTRc33Ip8qrNYUcpkOHUT5OZ0bUcNNVZQ9RLlg==",
      "cpu": [
        "arm"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "android"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/@esbuild/android-arm64": {
      "version": "0.25.12",
      "resolved": "https://registry.npmjs.org/@esbuild/android-arm64/-/android-arm64-0.25.12.tgz",
      "integrity": "sha512-6AAmLG7zwD1Z159jCKPvAxZd4y/VTO0VkprYy+3N2FtJ8+BQWFXU+OxARIwA46c5tdD9SsKGZ/1ocqBS/gAKHg==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "android"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/@esbuild/android-x64": {
      "version": "0.25.12",
      "resolved": "https://registry.npmjs.org/@esbuild/android-x64/-/android-x64-0.25.12.tgz",
      "integrity": "sha512-5jbb+2hhDHx5phYR2By8GTWEzn6I9UqR11Kwf22iKbNpYrsmRB18aX/9ivc5cabcUiAT/wM+YIZ6SG9QO6a8kg==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "android"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/@esbuild/darwin-arm64": {
      "version": "0.25.12",
      "resolved": "https://registry.npmjs.org/@esbuild/darwin-arm64/-/darwin-arm64-0.25.12.tgz",
      "integrity": "sha512-N3zl+lxHCifgIlcMUP5016ESkeQjLj/959RxxNYIthIg+CQHInujFuXeWbWMgnTo4cp5XVHqFPmpyu9J65C1Yg==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "darwin"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/@esbuild/darwin-x64": {
      "version": "0.25.12",
      "resolved": "https://registry.npmjs.org/@esbuild/darwin-x64/-/darwin-x64-0.25.12.tgz",
      "integrity": "sha512-HQ9ka4Kx21qHXwtlTUVbKJOAnmG1ipXhdWTmNXiPzPfWKpXqASVcWdnf2bnL73wgjNrFXAa3yYvBSd9pzfEIpA==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "darwin"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/@esbuild/freebsd-arm64": {
      "version": "0.25.12",
      "resolved": "https://registry.npmjs.org/@esbuild/freebsd-arm64/-/freebsd-arm64-0.25.12.tgz",
      "integrity": "sha512-gA0Bx759+7Jve03K1S0vkOu5Lg/85dou3EseOGUes8flVOGxbhDDh/iZaoek11Y8mtyKPGF3vP8XhnkDEAmzeg==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "freebsd"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/@esbuild/freebsd-x64": {
      "version": "0.25.12",
      "resolved": "https://registry.npmjs.org/@esbuild/freebsd-x64/-/freebsd-x64-0.25.12.tgz",
      "integrity": "sha512-TGbO26Yw2xsHzxtbVFGEXBFH0FRAP7gtcPE7P5yP7wGy7cXK2oO7RyOhL5NLiqTlBh47XhmIUXuGciXEqYFfBQ==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "freebsd"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/@esbuild/linux-arm": {
      "version": "0.25.12",
      "resolved": "https://registry.npmjs.org/@esbuild/linux-arm/-/linux-arm-0.25.12.tgz",
      "integrity": "sha512-lPDGyC1JPDou8kGcywY0YILzWlhhnRjdof3UlcoqYmS9El818LLfJJc3PXXgZHrHCAKs/Z2SeZtDJr5MrkxtOw==",
      "cpu": [
        "arm"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/@esbuild/linux-arm64": {
      "version": "0.25.12",
      "resolved": "https://registry.npmjs.org/@esbuild/linux-arm64/-/linux-arm64-0.25.12.tgz",
      "integrity": "sha512-8bwX7a8FghIgrupcxb4aUmYDLp8pX06rGh5HqDT7bB+8Rdells6mHvrFHHW2JAOPZUbnjUpKTLg6ECyzvas2AQ==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/@esbuild/linux-ia32": {
      "version": "0.25.12",
      "resolved": "https://registry.npmjs.org/@esbuild/linux-ia32/-/linux-ia32-0.25.12.tgz",
      "integrity": "sha512-0y9KrdVnbMM2/vG8KfU0byhUN+EFCny9+8g202gYqSSVMonbsCfLjUO+rCci7pM0WBEtz+oK/PIwHkzxkyharA==",
      "cpu": [
        "ia32"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/@esbuild/linux-loong64": {
      "version": "0.25.12",
      "resolved": "https://registry.npmjs.org/@esbuild/linux-loong64/-/linux-loong64-0.25.12.tgz",
      "integrity": "sha512-h///Lr5a9rib/v1GGqXVGzjL4TMvVTv+s1DPoxQdz7l/AYv6LDSxdIwzxkrPW438oUXiDtwM10o9PmwS/6Z0Ng==",
      "cpu": [
        "loong64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/@esbuild/linux-mips64el": {
      "version": "0.25.12",
      "resolved": "https://registry.npmjs.org/@esbuild/linux-mips64el/-/linux-mips64el-0.25.12.tgz",
      "integrity": "sha512-iyRrM1Pzy9GFMDLsXn1iHUm18nhKnNMWscjmp4+hpafcZjrr2WbT//d20xaGljXDBYHqRcl8HnxbX6uaA/eGVw==",
      "cpu": [
        "mips64el"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/@esbuild/linux-ppc64": {
      "version": "0.25.12",
      "resolved": "https://registry.npmjs.org/@esbuild/linux-ppc64/-/linux-ppc64-0.25.12.tgz",
      "integrity": "sha512-9meM/lRXxMi5PSUqEXRCtVjEZBGwB7P/D4yT8UG/mwIdze2aV4Vo6U5gD3+RsoHXKkHCfSxZKzmDssVlRj1QQA==",
      "cpu": [
        "ppc64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/@esbuild/linux-riscv64": {
      "version": "0.25.12",
      "resolved": "https://registry.npmjs.org/@esbuild/linux-riscv64/-/linux-riscv64-0.25.12.tgz",
      "integrity": "sha512-Zr7KR4hgKUpWAwb1f3o5ygT04MzqVrGEGXGLnj15YQDJErYu/BGg+wmFlIDOdJp0PmB0lLvxFIOXZgFRrdjR0w==",
      "cpu": [
        "riscv64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/@esbuild/linux-s390x": {
      "version": "0.25.12",
      "resolved": "https://registry.npmjs.org/@esbuild/linux-s390x/-/linux-s390x-0.25.12.tgz",
      "integrity": "sha512-MsKncOcgTNvdtiISc/jZs/Zf8d0cl/t3gYWX8J9ubBnVOwlk65UIEEvgBORTiljloIWnBzLs4qhzPkJcitIzIg==",
      "cpu": [
        "s390x"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/@esbuild/linux-x64": {
      "version": "0.25.12",
      "resolved": "https://registry.npmjs.org/@esbuild/linux-x64/-/linux-x64-0.25.12.tgz",
      "integrity": "sha512-uqZMTLr/zR/ed4jIGnwSLkaHmPjOjJvnm6TVVitAa08SLS9Z0VM8wIRx7gWbJB5/J54YuIMInDquWyYvQLZkgw==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/@esbuild/netbsd-arm64": {
      "version": "0.25.12",
      "resolved": "https://registry.npmjs.org/@esbuild/netbsd-arm64/-/netbsd-arm64-0.25.12.tgz",
      "integrity": "sha512-xXwcTq4GhRM7J9A8Gv5boanHhRa/Q9KLVmcyXHCTaM4wKfIpWkdXiMog/KsnxzJ0A1+nD+zoecuzqPmCRyBGjg==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "netbsd"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/@esbuild/netbsd-x64": {
      "version": "0.25.12",
      "resolved": "https://registry.npmjs.org/@esbuild/netbsd-x64/-/netbsd-x64-0.25.12.tgz",
      "integrity": "sha512-Ld5pTlzPy3YwGec4OuHh1aCVCRvOXdH8DgRjfDy/oumVovmuSzWfnSJg+VtakB9Cm0gxNO9BzWkj6mtO1FMXkQ==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "netbsd"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/@esbuild/openbsd-arm64": {
      "version": "0.25.12",
      "resolved": "https://registry.npmjs.org/@esbuild/openbsd-arm64/-/openbsd-arm64-0.25.12.tgz",
      "integrity": "sha512-fF96T6KsBo/pkQI950FARU9apGNTSlZGsv1jZBAlcLL1MLjLNIWPBkj5NlSz8aAzYKg+eNqknrUJ24QBybeR5A==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "openbsd"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/@esbuild/openbsd-x64": {
      "version": "0.25.12",
      "resolved": "https://registry.npmjs.org/@esbuild/openbsd-x64/-/openbsd-x64-0.25.12.tgz",
      "integrity": "sha512-MZyXUkZHjQxUvzK7rN8DJ3SRmrVrke8ZyRusHlP+kuwqTcfWLyqMOE3sScPPyeIXN/mDJIfGXvcMqCgYKekoQw==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "openbsd"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/@esbuild/openharmony-arm64": {
      "version": "0.25.12",
      "resolved": "https://registry.npmjs.org/@esbuild/openharmony-arm64/-/openharmony-arm64-0.25.12.tgz",
      "integrity": "sha512-rm0YWsqUSRrjncSXGA7Zv78Nbnw4XL6/dzr20cyrQf7ZmRcsovpcRBdhD43Nuk3y7XIoW2OxMVvwuRvk9XdASg==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "openharmony"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/@esbuild/sunos-x64": {
      "version": "0.25.12",
      "resolved": "https://registry.npmjs.org/@esbuild/sunos-x64/-/sunos-x64-0.25.12.tgz",
      "integrity": "sha512-3wGSCDyuTHQUzt0nV7bocDy72r2lI33QL3gkDNGkod22EsYl04sMf0qLb8luNKTOmgF/eDEDP5BFNwoBKH441w==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "sunos"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/@esbuild/win32-arm64": {
      "version": "0.25.12",
      "resolved": "https://registry.npmjs.org/@esbuild/win32-arm64/-/win32-arm64-0.25.12.tgz",
      "integrity": "sha512-rMmLrur64A7+DKlnSuwqUdRKyd3UE7oPJZmnljqEptesKM8wx9J8gx5u0+9Pq0fQQW8vqeKebwNXdfOyP+8Bsg==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "win32"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/@esbuild/win32-ia32": {
      "version": "0.25.12",
      "resolved": "https://registry.npmjs.org/@esbuild/win32-ia32/-/win32-ia32-0.25.12.tgz",
      "integrity": "sha512-HkqnmmBoCbCwxUKKNPBixiWDGCpQGVsrQfJoVGYLPT41XWF8lHuE5N6WhVia2n4o5QK5M4tYr21827fNhi4byQ==",
      "cpu": [
        "ia32"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "win32"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/@esbuild/win32-x64": {
      "version": "0.25.12",
      "resolved": "https://registry.npmjs.org/@esbuild/win32-x64/-/win32-x64-0.25.12.tgz",
      "integrity": "sha512-alJC0uCZpTFrSL0CCDjcgleBXPnCrEAhTBILpeAp7M/OFgoqtAetfBzX0xM00MUsVVPpVjlPuMbREqnZCXaTnA==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "win32"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/@floating-ui/core": {
      "version": "0.7.3",
      "resolved": "https://registry.npmjs.org/@floating-ui/core/-/core-0.7.3.tgz",
      "integrity": "sha512-buc8BXHmG9l82+OQXOFU3Kr2XQx9ys01U/Q9HMIrZ300iLc8HLMgh7dcCqgYzAzf4BkoQvDcXf5Y+CuEZ5JBYg==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/@floating-ui/dom": {
      "version": "0.5.4",
      "resolved": "https://registry.npmjs.org/@floating-ui/dom/-/dom-0.5.4.tgz",
      "integrity": "sha512-419BMceRLq0RrmTSDxn8hf9R3VCJv2K9PUfugh5JyEFmdjzDo+e8U5EdR8nzKq8Yj1htzLm3b6eQEEam3/rrtg==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@floating-ui/core": "^0.7.3"
      }
    },
    "node_modules/@floating-ui/react-dom": {
      "version": "0.7.2",
      "resolved": "https://registry.npmjs.org/@floating-ui/react-dom/-/react-dom-0.7.2.tgz",
      "integrity": "sha512-1T0sJcpHgX/u4I1OzIEhlcrvkUN8ln39nz7fMoE/2HDHrPiMFoOGR7++GYyfUmIQHkkrTinaeQsO3XWubjSvGg==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@floating-ui/dom": "^0.5.3",
        "use-isomorphic-layout-effect": "^1.1.1"
      },
      "peerDependencies": {
        "react": ">=16.8.0",
        "react-dom": ">=16.8.0"
      }
    },
    "node_modules/@fontsource/instrument-serif": {
      "version": "5.3.0",
      "resolved": "https://registry.npmjs.org/@fontsource/instrument-serif/-/instrument-serif-5.3.0.tgz",
      "integrity": "sha512-mDiaIg0u67sYV59fie92Wz4sM8UiVlbL7fLxnFPCKkX15DMASEnQTREbaP5S5/3DCcsoAOcQ0sV9E4AeY4QqYQ==",
      "license": "OFL-1.1",
      "funding": {
        "url": "https://github.com/sponsors/ayuhito"
      }
    },
    "node_modules/@jridgewell/gen-mapping": {
      "version": "0.3.13",
      "resolved": "https://registry.npmjs.org/@jridgewell/gen-mapping/-/gen-mapping-0.3.13.tgz",
      "integrity": "sha512-2kkt/7niJ6MgEPxF0bYdQ6etZaA+fQvDcLKckhy1yIQOzaoKjBBjSj63/aLVjYE3qhRt5dvM+uUyfCg6UKCBbA==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@jridgewell/sourcemap-codec": "^1.5.0",
        "@jridgewell/trace-mapping": "^0.3.24"
      }
    },
    "node_modules/@jridgewell/remapping": {
      "version": "2.3.5",
      "resolved": "https://registry.npmjs.org/@jridgewell/remapping/-/remapping-2.3.5.tgz",
      "integrity": "sha512-LI9u/+laYG4Ds1TDKSJW2YPrIlcVYOwi2fUC6xB43lueCjgxV4lffOCZCtYFiH6TNOX+tQKXx97T4IKHbhyHEQ==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@jridgewell/gen-mapping": "^0.3.5",
        "@jridgewell/trace-mapping": "^0.3.24"
      }
    },
    "node_modules/@jridgewell/resolve-uri": {
      "version": "3.1.2",
      "resolved": "https://registry.npmjs.org/@jridgewell/resolve-uri/-/resolve-uri-3.1.2.tgz",
      "integrity": "sha512-bRISgCIjP20/tbWSPWMEi54QVPRZExkuD9lJL+UIxUKtwVJA8wW1Trb1jMs1RFXo1CBTNZ/5hpC9QvmKWdopKw==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=6.0.0"
      }
    },
    "node_modules/@jridgewell/sourcemap-codec": {
      "version": "1.6.0",
      "resolved": "https://registry.npmjs.org/@jridgewell/sourcemap-codec/-/sourcemap-codec-1.6.0.tgz",
      "integrity": "sha512-T7jf+5zgsZHwNJ4lvQ7/aezbyk0nNX+zJVWpmHA7VYsEx7a7qr5Rg5IbtJFqkgze5Y2sruq1RUY8Q837Od7iFw==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/@jridgewell/trace-mapping": {
      "version": "0.3.31",
      "resolved": "https://registry.npmjs.org/@jridgewell/trace-mapping/-/trace-mapping-0.3.31.tgz",
      "integrity": "sha512-zzNR+SdQSDJzc8joaeP8QQoCQr8NuYx2dIIytl1QeBEZHJ9uW6hebsrYgbz8hJwUQao3TWCMtmfV8Nu1twOLAw==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@jridgewell/resolve-uri": "^3.1.0",
        "@jridgewell/sourcemap-codec": "^1.4.14"
      }
    },
    "node_modules/@mediapipe/tasks-vision": {
      "version": "0.10.17",
      "resolved": "https://registry.npmjs.org/@mediapipe/tasks-vision/-/tasks-vision-0.10.17.tgz",
      "integrity": "sha512-CZWV/q6TTe8ta61cZXjfnnHsfWIdFhms03M9T7Cnd5y2mdpylJM0rF1qRq+wsQVRMLz1OYPVEBU9ph2Bx8cxrg==",
      "license": "Apache-2.0"
    },
    "node_modules/@monogrid/gainmap-js": {
      "version": "3.4.0",
      "resolved": "https://registry.npmjs.org/@monogrid/gainmap-js/-/gainmap-js-3.4.0.tgz",
      "integrity": "sha512-2Z0FATFHaoYJ8b+Y4y4Hgfn3FRFwuU5zRrk+9dFWp4uGAdHGqVEdP7HP+gLA3X469KXHmfupJaUbKo1b/aDKIg==",
      "license": "MIT",
      "dependencies": {
        "promise-worker-transferable": "^1.0.4"
      },
      "peerDependencies": {
        "three": ">= 0.159.0"
      }
    },
    "node_modules/@napi-rs/lzma-linux-x64-gnu": {
      "version": "1.5.1",
      "resolved": "https://registry.npmjs.org/@napi-rs/lzma-linux-x64-gnu/-/lzma-linux-x64-gnu-1.5.1.tgz",
      "integrity": "sha512-oTXEIha4SsuXdTA4Iyskj0kpdx2yVXdhd75c2v3xGrHFfVMsbhTPZU/nMPL4sWKo4pBHm3aucLaqGlF696dTyQ==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "libc": [
        "glibc"
      ],
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": "^22.20 || ^24.12 || >=25"
      }
    },
    "node_modules/@playwright/test": {
      "version": "1.64.0",
      "resolved": "https://registry.npmjs.org/@playwright/test/-/test-1.64.0.tgz",
      "integrity": "sha512-oTN9FNYuN6bqQMwiho6jJKLCG2/QOYCixGXuCjRmzOq23eODeukuY2XiAVoVpAECbuezMt1MHQjAiQxK8F+Y+g==",
      "dev": true,
      "license": "Apache-2.0",
      "dependencies": {
        "playwright": "1.64.0"
      },
      "bin": {
        "playwright": "cli.js"
      },
      "engines": {
        "node": ">=20"
      }
    },
    "node_modules/@radix-ui/primitive": {
      "version": "1.0.0",
      "resolved": "https://registry.npmjs.org/@radix-ui/primitive/-/primitive-1.0.0.tgz",
      "integrity": "sha512-3e7rn8FDMin4CgeL7Z/49smCA3rFYY3Ha2rUQ7HRWFadS5iCRw08ZgVT1LaNTCNqgvrUiyczLflrVrF0SRQtNA==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@babel/runtime": "^7.13.10"
      }
    },
    "node_modules/@radix-ui/react-arrow": {
      "version": "1.0.2",
      "resolved": "https://registry.npmjs.org/@radix-ui/react-arrow/-/react-arrow-1.0.2.tgz",
      "integrity": "sha512-fqYwhhI9IarZ0ll2cUSfKuXHlJK0qE4AfnRrPBbRwEH/4mGQn04/QFGomLi8TXWIdv9WJk//KgGm+aDxVIr1wA==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@babel/runtime": "^7.13.10",
        "@radix-ui/react-primitive": "1.0.2"
      },
      "peerDependencies": {
        "react": "^16.8 || ^17.0 || ^18.0",
        "react-dom": "^16.8 || ^17.0 || ^18.0"
      }
    },
    "node_modules/@radix-ui/react-compose-refs": {
      "version": "1.0.0",
      "resolved": "https://registry.npmjs.org/@radix-ui/react-compose-refs/-/react-compose-refs-1.0.0.tgz",
      "integrity": "sha512-0KaSv6sx787/hK3eF53iOkiSLwAGlFMx5lotrqD2pTjB18KbybKoEIgkNZTKC60YECDQTKGTRcDBILwZVqVKvA==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@babel/runtime": "^7.13.10"
      },
      "peerDependencies": {
        "react": "^16.8 || ^17.0 || ^18.0"
      }
    },
    "node_modules/@radix-ui/react-context": {
      "version": "1.0.0",
      "resolved": "https://registry.npmjs.org/@radix-ui/react-context/-/react-context-1.0.0.tgz",
      "integrity": "sha512-1pVM9RfOQ+n/N5PJK33kRSKsr1glNxomxONs5c49MliinBY6Yw2Q995qfBUUo0/Mbg05B/sGA0gkgPI7kmSHBg==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@babel/runtime": "^7.13.10"
      },
      "peerDependencies": {
        "react": "^16.8 || ^17.0 || ^18.0"
      }
    },
    "node_modules/@radix-ui/react-dismissable-layer": {
      "version": "1.0.3",
      "resolved": "https://registry.npmjs.org/@radix-ui/react-dismissable-layer/-/react-dismissable-layer-1.0.3.tgz",
      "integrity": "sha512-nXZOvFjOuHS1ovumntGV7NNoLaEp9JEvTht3MBjP44NSW5hUKj/8OnfN3+8WmB+CEhN44XaGhpHoSsUIEl5P7Q==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@babel/runtime": "^7.13.10",
        "@radix-ui/primitive": "1.0.0",
        "@radix-ui/react-compose-refs": "1.0.0",
        "@radix-ui/react-primitive": "1.0.2",
        "@radix-ui/react-use-callback-ref": "1.0.0",
        "@radix-ui/react-use-escape-keydown": "1.0.2"
      },
      "peerDependencies": {
        "react": "^16.8 || ^17.0 || ^18.0",
        "react-dom": "^16.8 || ^17.0 || ^18.0"
      }
    },
    "node_modules/@radix-ui/react-id": {
      "version": "1.0.0",
      "resolved": "https://registry.npmjs.org/@radix-ui/react-id/-/react-id-1.0.0.tgz",
      "integrity": "sha512-Q6iAB/U7Tq3NTolBBQbHTgclPmGWE3OlktGGqrClPozSw4vkQ1DfQAOtzgRPecKsMdJINE05iaoDUG8tRzCBjw==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@babel/runtime": "^7.13.10",
        "@radix-ui/react-use-layout-effect": "1.0.0"
      },
      "peerDependencies": {
        "react": "^16.8 || ^17.0 || ^18.0"
      }
    },
    "node_modules/@radix-ui/react-popper": {
      "version": "1.1.1",
      "resolved": "https://registry.npmjs.org/@radix-ui/react-popper/-/react-popper-1.1.1.tgz",
      "integrity": "sha512-keYDcdMPNMjSC8zTsZ8wezUMiWM9Yj14wtF3s0PTIs9srnEPC9Kt2Gny1T3T81mmSeyDjZxsD9N5WCwNNb712w==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@babel/runtime": "^7.13.10",
        "@floating-ui/react-dom": "0.7.2",
        "@radix-ui/react-arrow": "1.0.2",
        "@radix-ui/react-compose-refs": "1.0.0",
        "@radix-ui/react-context": "1.0.0",
        "@radix-ui/react-primitive": "1.0.2",
        "@radix-ui/react-use-callback-ref": "1.0.0",
        "@radix-ui/react-use-layout-effect": "1.0.0",
        "@radix-ui/react-use-rect": "1.0.0",
        "@radix-ui/react-use-size": "1.0.0",
        "@radix-ui/rect": "1.0.0"
      },
      "peerDependencies": {
        "react": "^16.8 || ^17.0 || ^18.0",
        "react-dom": "^16.8 || ^17.0 || ^18.0"
      }
    },
    "node_modules/@radix-ui/react-portal": {
      "version": "1.0.2",
      "resolved": "https://registry.npmjs.org/@radix-ui/react-portal/-/react-portal-1.0.2.tgz",
      "integrity": "sha512-swu32idoCW7KA2VEiUZGBSu9nB6qwGdV6k6HYhUoOo3M1FFpD+VgLzUqtt3mwL1ssz7r2x8MggpLSQach2Xy/Q==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@babel/runtime": "^7.13.10",
        "@radix-ui/react-primitive": "1.0.2"
      },
      "peerDependencies": {
        "react": "^16.8 || ^17.0 || ^18.0",
        "react-dom": "^16.8 || ^17.0 || ^18.0"
      }
    },
    "node_modules/@radix-ui/react-presence": {
      "version": "1.0.0",
      "resolved": "https://registry.npmjs.org/@radix-ui/react-presence/-/react-presence-1.0.0.tgz",
      "integrity": "sha512-A+6XEvN01NfVWiKu38ybawfHsBjWum42MRPnEuqPsBZ4eV7e/7K321B5VgYMPv3Xx5An6o1/l9ZuDBgmcmWK3w==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@babel/runtime": "^7.13.10",
        "@radix-ui/react-compose-refs": "1.0.0",
        "@radix-ui/react-use-layout-effect": "1.0.0"
      },
      "peerDependencies": {
        "react": "^16.8 || ^17.0 || ^18.0",
        "react-dom": "^16.8 || ^17.0 || ^18.0"
      }
    },
    "node_modules/@radix-ui/react-primitive": {
      "version": "1.0.2",
      "resolved": "https://registry.npmjs.org/@radix-ui/react-primitive/-/react-primitive-1.0.2.tgz",
      "integrity": "sha512-zY6G5Qq4R8diFPNwtyoLRZBxzu1Z+SXMlfYpChN7Dv8gvmx9X3qhDqiLWvKseKVJMuedFeU/Sa0Sy/Ia+t06Dw==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@babel/runtime": "^7.13.10",
        "@radix-ui/react-slot": "1.0.1"
      },
      "peerDependencies": {
        "react": "^16.8 || ^17.0 || ^18.0",
        "react-dom": "^16.8 || ^17.0 || ^18.0"
      }
    },
    "node_modules/@radix-ui/react-slot": {
      "version": "1.0.1",
      "resolved": "https://registry.npmjs.org/@radix-ui/react-slot/-/react-slot-1.0.1.tgz",
      "integrity": "sha512-avutXAFL1ehGvAXtPquu0YK5oz6ctS474iM3vNGQIkswrVhdrS52e3uoMQBzZhNRAIE0jBnUyXWNmSjGHhCFcw==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@babel/runtime": "^7.13.10",
        "@radix-ui/react-compose-refs": "1.0.0"
      },
      "peerDependencies": {
        "react": "^16.8 || ^17.0 || ^18.0"
      }
    },
    "node_modules/@radix-ui/react-tooltip": {
      "version": "1.0.5",
      "resolved": "https://registry.npmjs.org/@radix-ui/react-tooltip/-/react-tooltip-1.0.5.tgz",
      "integrity": "sha512-cDKVcfzyO6PpckZekODJZDe5ZxZ2fCZlzKzTmPhe4mX9qTHRfLcKgqb0OKf22xLwDequ2tVleim+ZYx3rabD5w==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@babel/runtime": "^7.13.10",
        "@radix-ui/primitive": "1.0.0",
        "@radix-ui/react-compose-refs": "1.0.0",
        "@radix-ui/react-context": "1.0.0",
        "@radix-ui/react-dismissable-layer": "1.0.3",
        "@radix-ui/react-id": "1.0.0",
        "@radix-ui/react-popper": "1.1.1",
        "@radix-ui/react-portal": "1.0.2",
        "@radix-ui/react-presence": "1.0.0",
        "@radix-ui/react-primitive": "1.0.2",
        "@radix-ui/react-slot": "1.0.1",
        "@radix-ui/react-use-controllable-state": "1.0.0",
        "@radix-ui/react-visually-hidden": "1.0.2"
      },
      "peerDependencies": {
        "react": "^16.8 || ^17.0 || ^18.0",
        "react-dom": "^16.8 || ^17.0 || ^18.0"
      }
    },
    "node_modules/@radix-ui/react-use-callback-ref": {
      "version": "1.0.0",
      "resolved": "https://registry.npmjs.org/@radix-ui/react-use-callback-ref/-/react-use-callback-ref-1.0.0.tgz",
      "integrity": "sha512-GZtyzoHz95Rhs6S63D2t/eqvdFCm7I+yHMLVQheKM7nBD8mbZIt+ct1jz4536MDnaOGKIxynJ8eHTkVGVVkoTg==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@babel/runtime": "^7.13.10"
      },
      "peerDependencies": {
        "react": "^16.8 || ^17.0 || ^18.0"
      }
    },
    "node_modules/@radix-ui/react-use-controllable-state": {
      "version": "1.0.0",
      "resolved": "https://registry.npmjs.org/@radix-ui/react-use-controllable-state/-/react-use-controllable-state-1.0.0.tgz",
      "integrity": "sha512-FohDoZvk3mEXh9AWAVyRTYR4Sq7/gavuofglmiXB2g1aKyboUD4YtgWxKj8O5n+Uak52gXQ4wKz5IFST4vtJHg==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@babel/runtime": "^7.13.10",
        "@radix-ui/react-use-callback-ref": "1.0.0"
      },
      "peerDependencies": {
        "react": "^16.8 || ^17.0 || ^18.0"
      }
    },
    "node_modules/@radix-ui/react-use-escape-keydown": {
      "version": "1.0.2",
      "resolved": "https://registry.npmjs.org/@radix-ui/react-use-escape-keydown/-/react-use-escape-keydown-1.0.2.tgz",
      "integrity": "sha512-DXGim3x74WgUv+iMNCF+cAo8xUHHeqvjx8zs7trKf+FkQKPQXLk2sX7Gx1ysH7Q76xCpZuxIJE7HLPxRE+Q+GA==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@babel/runtime": "^7.13.10",
        "@radix-ui/react-use-callback-ref": "1.0.0"
      },
      "peerDependencies": {
        "react": "^16.8 || ^17.0 || ^18.0"
      }
    },
    "node_modules/@radix-ui/react-use-layout-effect": {
      "version": "1.0.0",
      "resolved": "https://registry.npmjs.org/@radix-ui/react-use-layout-effect/-/react-use-layout-effect-1.0.0.tgz",
      "integrity": "sha512-6Tpkq+R6LOlmQb1R5NNETLG0B4YP0wc+klfXafpUCj6JGyaUc8il7/kUZ7m59rGbXGczE9Bs+iz2qloqsZBduQ==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@babel/runtime": "^7.13.10"
      },
      "peerDependencies": {
        "react": "^16.8 || ^17.0 || ^18.0"
      }
    },
    "node_modules/@radix-ui/react-use-rect": {
      "version": "1.0.0",
      "resolved": "https://registry.npmjs.org/@radix-ui/react-use-rect/-/react-use-rect-1.0.0.tgz",
      "integrity": "sha512-TB7pID8NRMEHxb/qQJpvSt3hQU4sqNPM1VCTjTRjEOa7cEop/QMuq8S6fb/5Tsz64kqSvB9WnwsDHtjnrM9qew==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@babel/runtime": "^7.13.10",
        "@radix-ui/rect": "1.0.0"
      },
      "peerDependencies": {
        "react": "^16.8 || ^17.0 || ^18.0"
      }
    },
    "node_modules/@radix-ui/react-use-size": {
      "version": "1.0.0",
      "resolved": "https://registry.npmjs.org/@radix-ui/react-use-size/-/react-use-size-1.0.0.tgz",
      "integrity": "sha512-imZ3aYcoYCKhhgNpkNDh/aTiU05qw9hX+HHI1QDBTyIlcFjgeFlKKySNGMwTp7nYFLQg/j0VA2FmCY4WPDDHMg==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@babel/runtime": "^7.13.10",
        "@radix-ui/react-use-layout-effect": "1.0.0"
      },
      "peerDependencies": {
        "react": "^16.8 || ^17.0 || ^18.0"
      }
    },
    "node_modules/@radix-ui/react-visually-hidden": {
      "version": "1.0.2",
      "resolved": "https://registry.npmjs.org/@radix-ui/react-visually-hidden/-/react-visually-hidden-1.0.2.tgz",
      "integrity": "sha512-qirnJxtYn73HEk1rXL12/mXnu2rwsNHDID10th2JGtdK25T9wX+mxRmGt7iPSahw512GbZOc0syZX1nLQGoEOg==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@babel/runtime": "^7.13.10",
        "@radix-ui/react-primitive": "1.0.2"
      },
      "peerDependencies": {
        "react": "^16.8 || ^17.0 || ^18.0",
        "react-dom": "^16.8 || ^17.0 || ^18.0"
      }
    },
    "node_modules/@radix-ui/rect": {
      "version": "1.0.0",
      "resolved": "https://registry.npmjs.org/@radix-ui/rect/-/rect-1.0.0.tgz",
      "integrity": "sha512-d0O68AYy/9oeEy1DdC07bz1/ZXX+DqCskRd3i4JzLSTXwefzaepQrKjXC7aNM8lTHjFLDO0pDgaEiQ7jEk+HVg==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@babel/runtime": "^7.13.10"
      }
    },
    "node_modules/@react-spring/animated": {
      "version": "9.7.5",
      "resolved": "https://registry.npmjs.org/@react-spring/animated/-/animated-9.7.5.tgz",
      "integrity": "sha512-Tqrwz7pIlsSDITzxoLS3n/v/YCUHQdOIKtOJf4yL6kYVSDTSmVK1LI1Q3M/uu2Sx4X3pIWF3xLUhlsA6SPNTNg==",
      "license": "MIT",
      "dependencies": {
        "@react-spring/shared": "~9.7.5",
        "@react-spring/types": "~9.7.5"
      },
      "peerDependencies": {
        "react": "^16.8.0 || ^17.0.0 || ^18.0.0"
      }
    },
    "node_modules/@react-spring/core": {
      "version": "9.7.5",
      "resolved": "https://registry.npmjs.org/@react-spring/core/-/core-9.7.5.tgz",
      "integrity": "sha512-rmEqcxRcu7dWh7MnCcMXLvrf6/SDlSokLaLTxiPlAYi11nN3B5oiCUAblO72o+9z/87j2uzxa2Inm8UbLjXA+w==",
      "license": "MIT",
      "dependencies": {
        "@react-spring/animated": "~9.7.5",
        "@react-spring/shared": "~9.7.5",
        "@react-spring/types": "~9.7.5"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/react-spring/donate"
      },
      "peerDependencies": {
        "react": "^16.8.0 || ^17.0.0 || ^18.0.0"
      }
    },
    "node_modules/@react-spring/rafz": {
      "version": "9.7.5",
      "resolved": "https://registry.npmjs.org/@react-spring/rafz/-/rafz-9.7.5.tgz",
      "integrity": "sha512-5ZenDQMC48wjUzPAm1EtwQ5Ot3bLIAwwqP2w2owG5KoNdNHpEJV263nGhCeKKmuA3vG2zLLOdu3or6kuDjA6Aw==",
      "license": "MIT"
    },
    "node_modules/@react-spring/shared": {
      "version": "9.7.5",
      "resolved": "https://registry.npmjs.org/@react-spring/shared/-/shared-9.7.5.tgz",
      "integrity": "sha512-wdtoJrhUeeyD/PP/zo+np2s1Z820Ohr/BbuVYv+3dVLW7WctoiN7std8rISoYoHpUXtbkpesSKuPIw/6U1w1Pw==",
      "license": "MIT",
      "dependencies": {
        "@react-spring/rafz": "~9.7.5",
        "@react-spring/types": "~9.7.5"
      },
      "peerDependencies": {
        "react": "^16.8.0 || ^17.0.0 || ^18.0.0"
      }
    },
    "node_modules/@react-spring/three": {
      "version": "9.7.5",
      "resolved": "https://registry.npmjs.org/@react-spring/three/-/three-9.7.5.tgz",
      "integrity": "sha512-RxIsCoQfUqOS3POmhVHa1wdWS0wyHAUway73uRLp3GAL5U2iYVNdnzQsep6M2NZ994BlW8TcKuMtQHUqOsy6WA==",
      "license": "MIT",
      "dependencies": {
        "@react-spring/animated": "~9.7.5",
        "@react-spring/core": "~9.7.5",
        "@react-spring/shared": "~9.7.5",
        "@react-spring/types": "~9.7.5"
      },
      "peerDependencies": {
        "@react-three/fiber": ">=6.0",
        "react": "^16.8.0 || ^17.0.0 || ^18.0.0",
        "three": ">=0.126"
      }
    },
    "node_modules/@react-spring/types": {
      "version": "9.7.5",
      "resolved": "https://registry.npmjs.org/@react-spring/types/-/types-9.7.5.tgz",
      "integrity": "sha512-HVj7LrZ4ReHWBimBvu2SKND3cDVUPWKLqRTmWe/fNY6o1owGOX0cAHbdPDTMelgBlVbrTKrre6lFkhqGZErK/g==",
      "license": "MIT"
    },
    "node_modules/@react-three/drei": {
      "version": "9.122.0",
      "resolved": "https://registry.npmjs.org/@react-three/drei/-/drei-9.122.0.tgz",
      "integrity": "sha512-SEO/F/rBCTjlLez7WAlpys+iGe9hty4rNgjZvgkQeXFSiwqD4Hbk/wNHMAbdd8vprO2Aj81mihv4dF5bC7D0CA==",
      "license": "MIT",
      "dependencies": {
        "@babel/runtime": "^7.26.0",
        "@mediapipe/tasks-vision": "0.10.17",
        "@monogrid/gainmap-js": "^3.0.6",
        "@react-spring/three": "~9.7.5",
        "@use-gesture/react": "^10.3.1",
        "camera-controls": "^2.9.0",
        "cross-env": "^7.0.3",
        "detect-gpu": "^5.0.56",
        "glsl-noise": "^0.0.0",
        "hls.js": "^1.5.17",
        "maath": "^0.10.8",
        "meshline": "^3.3.1",
        "react-composer": "^5.0.3",
        "stats-gl": "^2.2.8",
        "stats.js": "^0.17.0",
        "suspend-react": "^0.1.3",
        "three-mesh-bvh": "^0.7.8",
        "three-stdlib": "^2.35.6",
        "troika-three-text": "^0.52.0",
        "tunnel-rat": "^0.1.2",
        "utility-types": "^3.11.0",
        "zustand": "^5.0.1"
      },
      "peerDependencies": {
        "@react-three/fiber": "^8",
        "react": "^18",
        "react-dom": "^18",
        "three": ">=0.137"
      },
      "peerDependenciesMeta": {
        "react-dom": {
          "optional": true
        }
      }
    },
    "node_modules/@react-three/fiber": {
      "version": "8.18.0",
      "resolved": "https://registry.npmjs.org/@react-three/fiber/-/fiber-8.18.0.tgz",
      "integrity": "sha512-FYZZqD0UUHUswKz3LQl2Z7H24AhD14XGTsIRw3SJaXUxyfVMi+1yiZGmqTcPt/CkPpdU7rrxqcyQ1zJE5DjvIQ==",
      "license": "MIT",
      "dependencies": {
        "@babel/runtime": "^7.17.8",
        "@types/react-reconciler": "^0.26.7",
        "@types/webxr": "*",
        "base64-js": "^1.5.1",
        "buffer": "^6.0.3",
        "its-fine": "^1.0.6",
        "react-reconciler": "^0.27.0",
        "react-use-measure": "^2.1.7",
        "scheduler": "^0.21.0",
        "suspend-react": "^0.1.3",
        "zustand": "^3.7.1"
      },
      "peerDependencies": {
        "expo": ">=43.0",
        "expo-asset": ">=8.4",
        "expo-file-system": ">=11.0",
        "expo-gl": ">=11.0",
        "react": ">=18 <19",
        "react-dom": ">=18 <19",
        "react-native": ">=0.64",
        "three": ">=0.133"
      },
      "peerDependenciesMeta": {
        "expo": {
          "optional": true
        },
        "expo-asset": {
          "optional": true
        },
        "expo-file-system": {
          "optional": true
        },
        "expo-gl": {
          "optional": true
        },
        "react-dom": {
          "optional": true
        },
        "react-native": {
          "optional": true
        }
      }
    },
    "node_modules/@react-three/fiber/node_modules/zustand": {
      "version": "3.7.2",
      "resolved": "https://registry.npmjs.org/zustand/-/zustand-3.7.2.tgz",
      "integrity": "sha512-PIJDIZKtokhof+9+60cpockVOq05sJzHCriyvaLBmEJixseQ1a5Kdov6fWZfWOu5SK9c+FhH1jU0tntLxRJYMA==",
      "license": "MIT",
      "engines": {
        "node": ">=12.7.0"
      },
      "peerDependencies": {
        "react": ">=16.8"
      },
      "peerDependenciesMeta": {
        "react": {
          "optional": true
        }
      }
    },
    "node_modules/@react-three/postprocessing": {
      "version": "2.19.1",
      "resolved": "https://registry.npmjs.org/@react-three/postprocessing/-/postprocessing-2.19.1.tgz",
      "integrity": "sha512-7P25LOSToH/I6b3UipNK17IIFlX4FDUmWcaomfwu82+CzhXTOz8Fcc1ZXEZ7vFA/5Fr/2peNlXgXZJvoa+aCdA==",
      "license": "MIT",
      "dependencies": {
        "buffer": "^6.0.3",
        "maath": "^0.6.0",
        "n8ao": "^1.6.6",
        "postprocessing": "^6.32.1",
        "three-stdlib": "^2.23.4"
      },
      "peerDependencies": {
        "@react-three/fiber": "^8.0",
        "react": "^18.0",
        "three": ">= 0.138.0"
      }
    },
    "node_modules/@react-three/postprocessing/node_modules/maath": {
      "version": "0.6.0",
      "resolved": "https://registry.npmjs.org/maath/-/maath-0.6.0.tgz",
      "integrity": "sha512-dSb2xQuP7vDnaYqfoKzlApeRcR2xtN8/f7WV/TMAkBC8552TwTLtOO0JTcSygkYMjNDPoo6V01jTw/aPi4JrMw==",
      "license": "MIT",
      "peerDependencies": {
        "@types/three": ">=0.144.0",
        "three": ">=0.144.0"
      }
    },
    "node_modules/@rolldown/pluginutils": {
      "version": "1.0.0-beta.27",
      "resolved": "https://registry.npmjs.org/@rolldown/pluginutils/-/pluginutils-1.0.0-beta.27.tgz",
      "integrity": "sha512-+d0F4MKMCbeVUJwG96uQ4SgAznZNSq93I3V+9NHA4OpvqG8mRCpGdKmK8l/dl02h2CCDHwW2FqilnTyDcAnqjA==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/@rollup/rollup-android-arm-eabi": {
      "version": "4.64.3",
      "resolved": "https://registry.npmjs.org/@rollup/rollup-android-arm-eabi/-/rollup-android-arm-eabi-4.64.3.tgz",
      "integrity": "sha512-a31GFbL70GlGUGhn8goVjRLtdDG1urLCJFWLZ7JcxdHK9pPvCohLFtYLgJDdNbtrNZSrJl1u9bK05ISsSC2EpA==",
      "cpu": [
        "arm"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "android"
      ]
    },
    "node_modules/@rollup/rollup-android-arm64": {
      "version": "4.64.3",
      "resolved": "https://registry.npmjs.org/@rollup/rollup-android-arm64/-/rollup-android-arm64-4.64.3.tgz",
      "integrity": "sha512-IRv757RLiPGlNxAX5JXU0eiUlUPvKiwFRbkqLd+gywptLK4uSEg1qkl6en6r0cXMazSnWUWOBABv+QfuLV3n5Q==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "android"
      ]
    },
    "node_modules/@rollup/rollup-darwin-arm64": {
      "version": "4.64.3",
      "resolved": "https://registry.npmjs.org/@rollup/rollup-darwin-arm64/-/rollup-darwin-arm64-4.64.3.tgz",
      "integrity": "sha512-UkzI35Fnz6+MJNATdnjnZ3TpdG/rXab8h7oDOD9R0zDVIFmuuYrvgUj8V8mh+A//+LR4TlEQo4ZW4RhyRtWv3A==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "darwin"
      ]
    },
    "node_modules/@rollup/rollup-darwin-x64": {
      "version": "4.64.3",
      "resolved": "https://registry.npmjs.org/@rollup/rollup-darwin-x64/-/rollup-darwin-x64-4.64.3.tgz",
      "integrity": "sha512-C3AyMtAnKQ/jSkZ0chIoWbPXRbFz8JnPLhl1ULecEhcaOGkT19xt7KmO8BulQxt9S/XideHRXvsVQUbGj4JCOg==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "darwin"
      ]
    },
    "node_modules/@rollup/rollup-freebsd-arm64": {
      "version": "4.64.3",
      "resolved": "https://registry.npmjs.org/@rollup/rollup-freebsd-arm64/-/rollup-freebsd-arm64-4.64.3.tgz",
      "integrity": "sha512-M8yAdBMyHh14JLeXDNGvEkljzuHdcoLBQ399O4Fp4nvX51lueuEY/5U2G9Ci0D6/bQlBp/3JLiBQH55STwwbwg==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "freebsd"
      ]
    },
    "node_modules/@rollup/rollup-freebsd-x64": {
      "version": "4.64.3",
      "resolved": "https://registry.npmjs.org/@rollup/rollup-freebsd-x64/-/rollup-freebsd-x64-4.64.3.tgz",
      "integrity": "sha512-WQjuOKGh2FN98ZK6i0uM6M6YqnPEds85p3oRkrxiEeTQo/p7RpuU8c9MwQ88LfgwVAzohumlzbQQSikz4Zw9rw==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "freebsd"
      ]
    },
    "node_modules/@rollup/rollup-linux-arm-gnueabihf": {
      "version": "4.64.3",
      "resolved": "https://registry.npmjs.org/@rollup/rollup-linux-arm-gnueabihf/-/rollup-linux-arm-gnueabihf-4.64.3.tgz",
      "integrity": "sha512-5tDLZG5s9WyVKoEHgwos6FpKrgpotl61EYeHSLSVkQzMzTsaClwEr8mok9rm3y734zjiGInG4dfw/56ebWVvEQ==",
      "cpu": [
        "arm"
      ],
      "dev": true,
      "libc": [
        "glibc"
      ],
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ]
    },
    "node_modules/@rollup/rollup-linux-arm-musleabihf": {
      "version": "4.64.3",
      "resolved": "https://registry.npmjs.org/@rollup/rollup-linux-arm-musleabihf/-/rollup-linux-arm-musleabihf-4.64.3.tgz",
      "integrity": "sha512-Mh5KbLeplM2HX6lQI18jsxSsqvPW8d+Hyk8HtY6Zl93woMitRSCZ92rBEzq6v8bfZGlpyMgj4P/sKW4KCjhH3A==",
      "cpu": [
        "arm"
      ],
      "dev": true,
      "libc": [
        "musl"
      ],
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ]
    },
    "node_modules/@rollup/rollup-linux-arm64-gnu": {
      "version": "4.64.3",
      "resolved": "https://registry.npmjs.org/@rollup/rollup-linux-arm64-gnu/-/rollup-linux-arm64-gnu-4.64.3.tgz",
      "integrity": "sha512-QZrrwHnznTv6y4iiHtCqDN+ZsF4qNFQObMOLgPrbxhh9O5o4rgoUe5OnkqG/ceCObMrAjhQt+eQ6HSDzBFgVMw==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "libc": [
        "glibc"
      ],
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ]
    },
    "node_modules/@rollup/rollup-linux-arm64-musl": {
      "version": "4.64.3",
      "resolved": "https://registry.npmjs.org/@rollup/rollup-linux-arm64-musl/-/rollup-linux-arm64-musl-4.64.3.tgz",
      "integrity": "sha512-4vLehpXSwlkltnvk5ETB+Hz+d3xayZS3NamZ5Vq4bSo+IUoIALovEJF1YgWPMjHwN7R5o/R4BpP9h3q8EK1xAA==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "libc": [
        "musl"
      ],
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ]
    },
    "node_modules/@rollup/rollup-linux-loong64-gnu": {
      "version": "4.64.3",
      "resolved": "https://registry.npmjs.org/@rollup/rollup-linux-loong64-gnu/-/rollup-linux-loong64-gnu-4.64.3.tgz",
      "integrity": "sha512-SEN7TTTOdXJKZmsWKOnQeVfgy3Dje/08ISXWwFhTggQ3SxjuIaChvmOB5ZDZqJNlBjaXrV6nAHraqEAvdLGqcw==",
      "cpu": [
        "loong64"
      ],
      "dev": true,
      "libc": [
        "glibc"
      ],
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ]
    },
    "node_modules/@rollup/rollup-linux-loong64-musl": {
      "version": "4.64.3",
      "resolved": "https://registry.npmjs.org/@rollup/rollup-linux-loong64-musl/-/rollup-linux-loong64-musl-4.64.3.tgz",
      "integrity": "sha512-1LDsQMRMCEdGF9Dih5qyh6fF1LK3NnA+pAtE2+9AgZwUdXyd19TOBVC9crSB63iZBHR4vOG7h8gN/LcUH3J7xw==",
      "cpu": [
        "loong64"
      ],
      "dev": true,
      "libc": [
        "musl"
      ],
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ]
    },
    "node_modules/@rollup/rollup-linux-ppc64-gnu": {
      "version": "4.64.3",
      "resolved": "https://registry.npmjs.org/@rollup/rollup-linux-ppc64-gnu/-/rollup-linux-ppc64-gnu-4.64.3.tgz",
      "integrity": "sha512-v3D2tAfRriqGOi+5Ac5CiYbBo2NXtLVxJlludTvUZRj502lVMFeVIuvvWbz4qCrotn3e3Uvpvh7FcMpG2QxxXQ==",
      "cpu": [
        "ppc64"
      ],
      "dev": true,
      "libc": [
        "glibc"
      ],
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ]
    },
    "node_modules/@rollup/rollup-linux-ppc64-musl": {
      "version": "4.64.3",
      "resolved": "https://registry.npmjs.org/@rollup/rollup-linux-ppc64-musl/-/rollup-linux-ppc64-musl-4.64.3.tgz",
      "integrity": "sha512-db5q6dP189V2+JkMpsXBl8ym6bC0x8ydZ47fUJZ9YdM6T2OF5uqNzX9HaAZHRP/lqjA9bJeNwi0qw1/2/37dUA==",
      "cpu": [
        "ppc64"
      ],
      "dev": true,
      "libc": [
        "musl"
      ],
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ]
    },
    "node_modules/@rollup/rollup-linux-riscv64-gnu": {
      "version": "4.64.3",
      "resolved": "https://registry.npmjs.org/@rollup/rollup-linux-riscv64-gnu/-/rollup-linux-riscv64-gnu-4.64.3.tgz",
      "integrity": "sha512-nArAVDmrL5ix9UoipcKEsYJw4kMUQCIPYRWuYF2POOC7jd9rmN95d/48ewsYFC/OdtwEx6VYYWYxrp8FbMOU2Q==",
      "cpu": [
        "riscv64"
      ],
      "dev": true,
      "libc": [
        "glibc"
      ],
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ]
    },
    "node_modules/@rollup/rollup-linux-riscv64-musl": {
      "version": "4.64.3",
      "resolved": "https://registry.npmjs.org/@rollup/rollup-linux-riscv64-musl/-/rollup-linux-riscv64-musl-4.64.3.tgz",
      "integrity": "sha512-2dc7LElu7EVSvpQT8epNnBLa02wlqilNYqHN0FA/RaKqCr9U9ZFYQ0Eh4sfgSzLneLDuJsJRjcezR/l2UyYGXA==",
      "cpu": [
        "riscv64"
      ],
      "dev": true,
      "libc": [
        "musl"
      ],
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ]
    },
    "node_modules/@rollup/rollup-linux-s390x-gnu": {
      "version": "4.64.3",
      "resolved": "https://registry.npmjs.org/@rollup/rollup-linux-s390x-gnu/-/rollup-linux-s390x-gnu-4.64.3.tgz",
      "integrity": "sha512-9PYq2IEzSwXcvQLERcT9LKXRzw8J05GFTbJHA2anJR2WmlRjA1esgXVYhanp+bmjKsDVoZeU2L7Z2pRClLcZTw==",
      "cpu": [
        "s390x"
      ],
      "dev": true,
      "libc": [
        "glibc"
      ],
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ]
    },
    "node_modules/@rollup/rollup-linux-x64-gnu": {
      "version": "4.64.3",
      "resolved": "https://registry.npmjs.org/@rollup/rollup-linux-x64-gnu/-/rollup-linux-x64-gnu-4.64.3.tgz",
      "integrity": "sha512-vMh+mt0cw1BHldd8cqaU6A5s1W4EUKl6+8MRsv86mj954L4xyruKD7qPXMUI2icImadAZARK10h0onaGTLmCVg==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "libc": [
        "glibc"
      ],
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ]
    },
    "node_modules/@rollup/rollup-linux-x64-musl": {
      "version": "4.64.3",
      "resolved": "https://registry.npmjs.org/@rollup/rollup-linux-x64-musl/-/rollup-linux-x64-musl-4.64.3.tgz",
      "integrity": "sha512-PpiKU+sWbqDGc0U0su8oXiyeyqm0UQjmaaPKHktX+DaLe6YKJwW2YVD0f2AXHdVvblZbRqpwRVClWP2F5HCqrQ==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "libc": [
        "musl"
      ],
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ]
    },
    "node_modules/@rollup/rollup-openbsd-x64": {
      "version": "4.64.3",
      "resolved": "https://registry.npmjs.org/@rollup/rollup-openbsd-x64/-/rollup-openbsd-x64-4.64.3.tgz",
      "integrity": "sha512-/3enY/AmaIt8IS0fWjX4ztYVPBqkj49cQTy/hCryhBFaEzDfJwwEolq9sxvyWAM2qmsmVuPdeRg5JXSrmeqvJg==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "openbsd"
      ]
    },
    "node_modules/@rollup/rollup-openharmony-arm64": {
      "version": "4.64.3",
      "resolved": "https://registry.npmjs.org/@rollup/rollup-openharmony-arm64/-/rollup-openharmony-arm64-4.64.3.tgz",
      "integrity": "sha512-zsEP/QDuet52hhwvi5T1VPg0/Tkms0m3zkVv7CPsznvhdO4pL4oJTMz26EJsiCe18OeLKPgpTu3XVO3C1eq3ew==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "openharmony"
      ]
    },
    "node_modules/@rollup/rollup-win32-arm64-msvc": {
      "version": "4.64.3",
      "resolved": "https://registry.npmjs.org/@rollup/rollup-win32-arm64-msvc/-/rollup-win32-arm64-msvc-4.64.3.tgz",
      "integrity": "sha512-4ESknW4Db+kqvazVOfsReYJaHxcIsOqcgwjKV2J1tG5Bn4RVf5ocTQKSGuq2HWBJcOLuyim8IWX8DuH6nKmELA==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "win32"
      ]
    },
    "node_modules/@rollup/rollup-win32-ia32-msvc": {
      "version": "4.64.3",
      "resolved": "https://registry.npmjs.org/@rollup/rollup-win32-ia32-msvc/-/rollup-win32-ia32-msvc-4.64.3.tgz",
      "integrity": "sha512-3B8VCQyIyv7FQxYYhb3HpR3bIpronR20txjMSffSoz/sm/DDs3/49CFpEueOsvq9qW9sWoI/6pi6mtciD9NXFg==",
      "cpu": [
        "ia32"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "win32"
      ]
    },
    "node_modules/@rollup/rollup-win32-x64-gnu": {
      "version": "4.64.3",
      "resolved": "https://registry.npmjs.org/@rollup/rollup-win32-x64-gnu/-/rollup-win32-x64-gnu-4.64.3.tgz",
      "integrity": "sha512-YOoDkKh2oQxOxRB5D9AR8sj3qpMShpmyTkjojiBjMGigz3caV7UvCnXWWUQC0TBmrZ5zuHe2pWl8S+cMfvXzRg==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "win32"
      ]
    },
    "node_modules/@rollup/rollup-win32-x64-msvc": {
      "version": "4.64.3",
      "resolved": "https://registry.npmjs.org/@rollup/rollup-win32-x64-msvc/-/rollup-win32-x64-msvc-4.64.3.tgz",
      "integrity": "sha512-qTv4bG+eKJKifzxNJevMUh8L6CjJrz9/Kn1IbP2F5bo0tBzNIR7HMg4vni6XmDzcKUl00lHHY+J5ZgjbGiujOQ==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "win32"
      ]
    },
    "node_modules/@stitches/react": {
      "version": "1.2.8",
      "resolved": "https://registry.npmjs.org/@stitches/react/-/react-1.2.8.tgz",
      "integrity": "sha512-9g9dWI4gsSVe8bNLlb+lMkBYsnIKCZTmvqvDG+Avnn69XfmHZKiaMrx7cgTaddq7aTPPmXiTsbFcUy0xgI4+wA==",
      "dev": true,
      "license": "MIT",
      "peerDependencies": {
        "react": ">= 16.3.0"
      }
    },
    "node_modules/@tweenjs/tween.js": {
      "version": "23.1.3",
      "resolved": "https://registry.npmjs.org/@tweenjs/tween.js/-/tween.js-23.1.3.tgz",
      "integrity": "sha512-vJmvvwFxYuGnF2axRtPYocag6Clbb5YS7kLL+SO/TeVFzHqDIWrNKYtcsPMibjDx9O+bu+psAy9NKfWklassUA==",
      "license": "MIT"
    },
    "node_modules/@types/babel__core": {
      "version": "7.20.5",
      "resolved": "https://registry.npmjs.org/@types/babel__core/-/babel__core-7.20.5.tgz",
      "integrity": "sha512-qoQprZvz5wQFJwMDqeseRXWv3rqMvhgpbXFfVyWhbx9X47POIA6i/+dXefEmZKoAgOaTdaIgNSMqMIU61yRyzA==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@babel/parser": "^7.20.7",
        "@babel/types": "^7.20.7",
        "@types/babel__generator": "*",
        "@types/babel__template": "*",
        "@types/babel__traverse": "*"
      }
    },
    "node_modules/@types/babel__generator": {
      "version": "7.27.0",
      "resolved": "https://registry.npmjs.org/@types/babel__generator/-/babel__generator-7.27.0.tgz",
      "integrity": "sha512-ufFd2Xi92OAVPYsy+P4n7/U7e68fex0+Ee8gSG9KX7eo084CWiQ4sdxktvdl0bOPupXtVJPY19zk6EwWqUQ8lg==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@babel/types": "^7.0.0"
      }
    },
    "node_modules/@types/babel__template": {
      "version": "7.4.4",
      "resolved": "https://registry.npmjs.org/@types/babel__template/-/babel__template-7.4.4.tgz",
      "integrity": "sha512-h/NUaSyG5EyxBIp8YRxo4RMe2/qQgvyowRwVMzhYhBCONbW8PUsg4lkFMrhgZhUe5z3L3MiLDuvyJ/CaPa2A8A==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@babel/parser": "^7.1.0",
        "@babel/types": "^7.0.0"
      }
    },
    "node_modules/@types/babel__traverse": {
      "version": "7.28.0",
      "resolved": "https://registry.npmjs.org/@types/babel__traverse/-/babel__traverse-7.28.0.tgz",
      "integrity": "sha512-8PvcXf70gTDZBgt9ptxJ8elBeBjcLOAcOtoO/mPJjtji1+CdGbHgm77om1GrsPxsiE+uXIpNSK64UYaIwQXd4Q==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@babel/types": "^7.28.2"
      }
    },
    "node_modules/@types/draco3d": {
      "version": "1.4.10",
      "resolved": "https://registry.npmjs.org/@types/draco3d/-/draco3d-1.4.10.tgz",
      "integrity": "sha512-AX22jp8Y7wwaBgAixaSvkoG4M/+PlAcm3Qs4OW8yT9DM4xUpWKeFhLueTAyZF39pviAdcDdeJoACapiAceqNcw==",
      "license": "MIT"
    },
    "node_modules/@types/estree": {
      "version": "1.0.9",
      "resolved": "https://registry.npmjs.org/@types/estree/-/estree-1.0.9.tgz",
      "integrity": "sha512-GhdPgy1el4/ImP05X05Uw4cw2/M93BCUmnEvWZNStlCzEKME4Fkk+YpoA5OiHNQmoS7Cafb8Xa3Pya8m1Qrzeg==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/@types/offscreencanvas": {
      "version": "2019.7.3",
      "resolved": "https://registry.npmjs.org/@types/offscreencanvas/-/offscreencanvas-2019.7.3.tgz",
      "integrity": "sha512-ieXiYmgSRXUDeOntE1InxjWyvEelZGP63M+cGuquuRLuIKKT1osnkXjxev9B7d1nXSug5vpunx+gNlbVxMlC9A==",
      "license": "MIT"
    },
    "node_modules/@types/prop-types": {
      "version": "15.7.15",
      "resolved": "https://registry.npmjs.org/@types/prop-types/-/prop-types-15.7.15.tgz",
      "integrity": "sha512-F6bEyamV9jKGAFBEmlQnesRPGOQqS2+Uwi0Em15xenOxHaf2hv6L8YCVn3rPdPJOiJfPiCnLIRyvwVaqMY3MIw==",
      "license": "MIT"
    },
    "node_modules/@types/react": {
      "version": "18.3.31",
      "resolved": "https://registry.npmjs.org/@types/react/-/react-18.3.31.tgz",
      "integrity": "sha512-vfEqpXTvwT91yhmwdfouStN2hSKwTvyRs8qpLfADyrq/kxDw0hZM7Wk9Ug1FELj8hIby+S/+kQCSRFF32nv2Qw==",
      "license": "MIT",
      "dependencies": {
        "@types/prop-types": "*",
        "csstype": "^3.2.2"
      }
    },
    "node_modules/@types/react-dom": {
      "version": "18.3.7",
      "resolved": "https://registry.npmjs.org/@types/react-dom/-/react-dom-18.3.7.tgz",
      "integrity": "sha512-MEe3UeoENYVFXzoXEWsvcpg6ZvlrFNlOQ7EOsvhI3CfAXwzPfO8Qwuxd40nepsYKqyyVQnTdEfv68q91yLcKrQ==",
      "dev": true,
      "license": "MIT",
      "peerDependencies": {
        "@types/react": "^18.0.0"
      }
    },
    "node_modules/@types/react-reconciler": {
      "version": "0.26.7",
      "resolved": "https://registry.npmjs.org/@types/react-reconciler/-/react-reconciler-0.26.7.tgz",
      "integrity": "sha512-mBDYl8x+oyPX/VBb3E638N0B7xG+SPk/EAMcVPeexqus/5aTpTphQi0curhhshOqRrc9t6OPoJfEUkbymse/lQ==",
      "license": "MIT",
      "dependencies": {
        "@types/react": "*"
      }
    },
    "node_modules/@types/stats.js": {
      "version": "0.17.4",
      "resolved": "https://registry.npmjs.org/@types/stats.js/-/stats.js-0.17.4.tgz",
      "integrity": "sha512-jIBvWWShCvlBqBNIZt0KAshWpvSjhkwkEu4ZUcASoAvhmrgAUI2t1dXrjSL4xXVLB4FznPrIsX3nKXFl/Dt4vA==",
      "license": "MIT"
    },
    "node_modules/@types/three": {
      "version": "0.170.0",
      "resolved": "https://registry.npmjs.org/@types/three/-/three-0.170.0.tgz",
      "integrity": "sha512-CUm2uckq+zkCY7ZbFpviRttY+6f9fvwm6YqSqPfA5K22s9w7R4VnA3rzJse8kHVvuzLcTx+CjNCs2NYe0QFAyg==",
      "license": "MIT",
      "dependencies": {
        "@tweenjs/tween.js": "~23.1.3",
        "@types/stats.js": "*",
        "@types/webxr": "*",
        "@webgpu/types": "*",
        "fflate": "~0.8.2",
        "meshoptimizer": "~0.18.1"
      }
    },
    "node_modules/@types/webxr": {
      "version": "0.5.24",
      "resolved": "https://registry.npmjs.org/@types/webxr/-/webxr-0.5.24.tgz",
      "integrity": "sha512-h8fgEd/DpoS9CBrjEQXR+dIDraopAEfu4wYVNY2tEPwk60stPWhvZMf4Foo5FakuQ7HFZoa8WceaWFervK2Ovg==",
      "license": "MIT"
    },
    "node_modules/@use-gesture/core": {
      "version": "10.3.1",
      "resolved": "https://registry.npmjs.org/@use-gesture/core/-/core-10.3.1.tgz",
      "integrity": "sha512-WcINiDt8WjqBdUXye25anHiNxPc0VOrlT8F6LLkU6cycrOGUDyY/yyFmsg3k8i5OLvv25llc0QC45GhR/C8llw==",
      "license": "MIT"
    },
    "node_modules/@use-gesture/react": {
      "version": "10.3.1",
      "resolved": "https://registry.npmjs.org/@use-gesture/react/-/react-10.3.1.tgz",
      "integrity": "sha512-Yy19y6O2GJq8f7CHf7L0nxL8bf4PZCPaVOCgJrusOeFHY1LvHgYXnmnXg6N5iwAnbgbZCDjo60SiM6IPJi9C5g==",
      "license": "MIT",
      "dependencies": {
        "@use-gesture/core": "10.3.1"
      },
      "peerDependencies": {
        "react": ">= 16.8.0"
      }
    },
    "node_modules/@vitejs/plugin-react": {
      "version": "4.7.0",
      "resolved": "https://registry.npmjs.org/@vitejs/plugin-react/-/plugin-react-4.7.0.tgz",
      "integrity": "sha512-gUu9hwfWvvEDBBmgtAowQCojwZmJ5mcLn3aufeCsitijs3+f2NsrPtlAWIR6OPiqljl96GVCUbLe0HyqIpVaoA==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@babel/core": "^7.28.0",
        "@babel/plugin-transform-react-jsx-self": "^7.27.1",
        "@babel/plugin-transform-react-jsx-source": "^7.27.1",
        "@rolldown/pluginutils": "1.0.0-beta.27",
        "@types/babel__core": "^7.20.5",
        "react-refresh": "^0.17.0"
      },
      "engines": {
        "node": "^14.18.0 || >=16.0.0"
      },
      "peerDependencies": {
        "vite": "^4.2.0 || ^5.0.0 || ^6.0.0 || ^7.0.0"
      }
    },
    "node_modules/@webgpu/types": {
      "version": "0.1.74",
      "resolved": "https://registry.npmjs.org/@webgpu/types/-/types-0.1.74.tgz",
      "integrity": "sha512-lgiI4hbuLcI9unnm2cL/tvCaQU45dp0xcLWJh5uB/9MBGvIA4F8XIk7nSiBeg+K4xWGYwgZKn80LmERI5CxoTA==",
      "license": "BSD-3-Clause"
    },
    "node_modules/assign-symbols": {
      "version": "1.0.0",
      "resolved": "https://registry.npmjs.org/assign-symbols/-/assign-symbols-1.0.0.tgz",
      "integrity": "sha512-Q+JC7Whu8HhmTdBph/Tq59IoRtoy6KAm5zzPv00WdujX82lbAL8K7WVjne7vdCsAmbF4AYaDOPyO3k0kl8qIrw==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=0.10.0"
      }
    },
    "node_modules/attr-accept": {
      "version": "2.2.5",
      "resolved": "https://registry.npmjs.org/attr-accept/-/attr-accept-2.2.5.tgz",
      "integrity": "sha512-0bDNnY/u6pPwHDMoF0FieU354oBi0a8rD9FcsLwzcGWbc8KS8KPIi7y+s13OlVY+gMWc/9xEMUgNE6Qm8ZllYQ==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=4"
      }
    },
    "node_modules/automation-events": {
      "version": "7.1.19",
      "resolved": "https://registry.npmjs.org/automation-events/-/automation-events-7.1.19.tgz",
      "integrity": "sha512-cD+TLhJTI0q4AI3ktd353lrGZiVa9AchowSDzQzzGjSoYe22js4vlS32VUtWuaulghi1Yq0KYNWKk9wWuGymPA==",
      "license": "MIT",
      "dependencies": {
        "@babel/runtime": "^7.29.2",
        "tslib": "^2.8.1"
      },
      "engines": {
        "node": ">=18.2.0"
      }
    },
    "node_modules/base64-js": {
      "version": "1.5.1",
      "resolved": "https://registry.npmjs.org/base64-js/-/base64-js-1.5.1.tgz",
      "integrity": "sha512-AKpaYlHn8t4SVbOHCy+b5+KKgvR4vrsD8vbvrbiQJps7fKDTkjkDry6ji0rUJjC0kzbNePLwzxq8iypo41qeWA==",
      "funding": [
        {
          "type": "github",
          "url": "https://github.com/sponsors/feross"
        },
        {
          "type": "patreon",
          "url": "https://www.patreon.com/feross"
        },
        {
          "type": "consulting",
          "url": "https://feross.org/support"
        }
      ],
      "license": "MIT"
    },
    "node_modules/baseline-browser-mapping": {
      "version": "2.11.28",
      "resolved": "https://registry.npmjs.org/baseline-browser-mapping/-/baseline-browser-mapping-2.11.28.tgz",
      "integrity": "sha512-br0LOmjJqr6Rt4AEkadbcNf67Zpo7EPwKsWbjnRrJIa1QYFHQBqM4C7F2WTbV8ahTEcg1Eo+Y0aWjjORInYFyA==",
      "dev": true,
      "license": "Apache-2.0",
      "bin": {
        "baseline-browser-mapping": "dist/cli.cjs"
      },
      "engines": {
        "node": ">=6.0.0"
      }
    },
    "node_modules/bidi-js": {
      "version": "1.1.0",
      "resolved": "https://registry.npmjs.org/bidi-js/-/bidi-js-1.1.0.tgz",
      "integrity": "sha512-fX1Onk0tdVPC7obPWB5EbJ1z7NVhLq4m2xZLq2YXBkxzMXIGRpNMU88n0EPgWseKl12J7zXs7qrDxPK4sRs2fg==",
      "license": "MIT",
      "dependencies": {
        "require-from-string": "^2.0.2"
      }
    },
    "node_modules/browserslist": {
      "version": "4.29.3",
      "resolved": "https://registry.npmjs.org/browserslist/-/browserslist-4.29.3.tgz",
      "integrity": "sha512-1R4kiYKXGViqEN0CnoDrXc1StD9niAwu+j2dukWzrD4bJgsD4lDmEp0CRbc6E/vYJIfTHwPmwyaKtVSudICdPA==",
      "dev": true,
      "funding": [
        {
          "type": "opencollective",
          "url": "https://opencollective.com/browserslist"
        },
        {
          "type": "tidelift",
          "url": "https://tidelift.com/funding/github/npm/browserslist"
        },
        {
          "type": "github",
          "url": "https://github.com/sponsors/ai"
        }
      ],
      "license": "MIT",
      "dependencies": {
        "baseline-browser-mapping": "^2.11.26",
        "caniuse-lite": "^1.0.30001813",
        "electron-to-chromium": "^1.5.439",
        "node-releases": "^2.0.57",
        "update-browserslist-db": "^1.3.3"
      },
      "bin": {
        "browserslist": "cli.js"
      },
      "engines": {
        "node": "^6 || ^7 || ^8 || ^9 || ^10 || ^11 || ^12 || >=13.7"
      }
    },
    "node_modules/buffer": {
      "version": "6.0.3",
      "resolved": "https://registry.npmjs.org/buffer/-/buffer-6.0.3.tgz",
      "integrity": "sha512-FTiCpNxtwiZZHEZbcbTIcZjERVICn9yq/pDFkTl95/AxzD1naBctN7YO68riM/gLSDY7sdrMby8hofADYuuqOA==",
      "funding": [
        {
          "type": "github",
          "url": "https://github.com/sponsors/feross"
        },
        {
          "type": "patreon",
          "url": "https://www.patreon.com/feross"
        },
        {
          "type": "consulting",
          "url": "https://feross.org/support"
        }
      ],
      "license": "MIT",
      "dependencies": {
        "base64-js": "^1.3.1",
        "ieee754": "^1.2.1"
      }
    },
    "node_modules/camera-controls": {
      "version": "2.10.1",
      "resolved": "https://registry.npmjs.org/camera-controls/-/camera-controls-2.10.1.tgz",
      "integrity": "sha512-KnaKdcvkBJ1Irbrzl8XD6WtZltkRjp869Jx8c0ujs9K+9WD+1D7ryBsCiVqJYUqt6i/HR5FxT7RLASieUD+Q5w==",
      "license": "MIT",
      "peerDependencies": {
        "three": ">=0.126.1"
      }
    },
    "node_modules/caniuse-lite": {
      "version": "1.0.30001815",
      "resolved": "https://registry.npmjs.org/caniuse-lite/-/caniuse-lite-1.0.30001815.tgz",
      "integrity": "sha512-uDybUEyfgbyJJ93J1vikTylBX31AkdVYeVPeffMQpf8XN7hSfr0oZOn4VFOIMNvtU5+rHvC5Udg2TgtJKHm23Q==",
      "dev": true,
      "funding": [
        {
          "type": "opencollective",
          "url": "https://opencollective.com/browserslist"
        },
        {
          "type": "tidelift",
          "url": "https://tidelift.com/funding/github/npm/caniuse-lite"
        },
        {
          "type": "github",
          "url": "https://github.com/sponsors/ai"
        }
      ],
      "license": "CC-BY-4.0"
    },
    "node_modules/colord": {
      "version": "2.10.0",
      "resolved": "https://registry.npmjs.org/colord/-/colord-2.10.0.tgz",
      "integrity": "sha512-AidJptpBJmjTclAp9BkLwJi0T93fo5epJnbaZslpg6QVzpHjAiveF55mE9AcUJiGMqRHgMDY8soMsQtuNYMHfw==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/convert-source-map": {
      "version": "2.0.0",
      "resolved": "https://registry.npmjs.org/convert-source-map/-/convert-source-map-2.0.0.tgz",
      "integrity": "sha512-Kvp459HrV2FEJ1CAsi1Ku+MY3kasH19TFykTz2xWmMeq6bk2NU3XXvfJ+Q61m0xktWwt+1HSYf3JZsTms3aRJg==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/cross-env": {
      "version": "7.0.3",
      "resolved": "https://registry.npmjs.org/cross-env/-/cross-env-7.0.3.tgz",
      "integrity": "sha512-+/HKd6EgcQCJGh2PSjZuUitQBQynKor4wrFbRg4DtAgS1aWO+gU52xpH7M9ScGgXSYmAVS9bIJ8EzuaGw0oNAw==",
      "license": "MIT",
      "dependencies": {
        "cross-spawn": "^7.0.1"
      },
      "bin": {
        "cross-env": "src/bin/cross-env.js",
        "cross-env-shell": "src/bin/cross-env-shell.js"
      },
      "engines": {
        "node": ">=10.14",
        "npm": ">=6",
        "yarn": ">=1"
      }
    },
    "node_modules/cross-spawn": {
      "version": "7.0.6",
      "resolved": "https://registry.npmjs.org/cross-spawn/-/cross-spawn-7.0.6.tgz",
      "integrity": "sha512-uV2QOWP2nWzsy2aMp8aRibhi9dlzF5Hgh5SHaB9OiTGEyDTiJJyx0uy51QXdyWbtAHNua4XJzUKca3OzKUd3vA==",
      "license": "MIT",
      "dependencies": {
        "path-key": "^3.1.0",
        "shebang-command": "^2.0.0",
        "which": "^2.0.1"
      },
      "engines": {
        "node": ">= 8"
      }
    },
    "node_modules/csstype": {
      "version": "3.2.3",
      "resolved": "https://registry.npmjs.org/csstype/-/csstype-3.2.3.tgz",
      "integrity": "sha512-z1HGKcYy2xA8AGQfwrn0PAy+PB7X/GSj3UVJW9qKyn43xWa+gl5nXmU4qqLMRzWVLFC8KusUX8T/0kCiOYpAIQ==",
      "license": "MIT"
    },
    "node_modules/debug": {
      "version": "4.4.3",
      "resolved": "https://registry.npmjs.org/debug/-/debug-4.4.3.tgz",
      "integrity": "sha512-RGwwWnwQvkVfavKVt22FGLw+xYSdzARwm0ru6DhTVA3umU5hZc28V3kO4stgYryrTlLpuvgI9GiijltAjNbcqA==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "ms": "^2.1.3"
      },
      "engines": {
        "node": ">=6.0"
      },
      "peerDependenciesMeta": {
        "supports-color": {
          "optional": true
        }
      }
    },
    "node_modules/dequal": {
      "version": "2.0.3",
      "resolved": "https://registry.npmjs.org/dequal/-/dequal-2.0.3.tgz",
      "integrity": "sha512-0je+qPKHEMohvfRTCEo3CrPG6cAzAYgmzKyxRiYSSDkS6eGJdyVJm7WaYA5ECaAD9wLB2T4EEeymA5aFVcYXCA==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=6"
      }
    },
    "node_modules/detect-gpu": {
      "version": "5.0.70",
      "resolved": "https://registry.npmjs.org/detect-gpu/-/detect-gpu-5.0.70.tgz",
      "integrity": "sha512-bqerEP1Ese6nt3rFkwPnGbsUF9a4q+gMmpTVVOEzoCyeCc+y7/RvJnQZJx1JwhgQI5Ntg0Kgat8Uu7XpBqnz1w==",
      "license": "MIT",
      "dependencies": {
        "webgl-constants": "^1.1.1"
      }
    },
    "node_modules/draco3d": {
      "version": "1.5.7",
      "resolved": "https://registry.npmjs.org/draco3d/-/draco3d-1.5.7.tgz",
      "integrity": "sha512-m6WCKt/erDXcw+70IJXnG7M3awwQPAsZvJGX5zY7beBqpELw6RDGkYVU0W43AFxye4pDZ5i2Lbyc/NNGqwjUVQ==",
      "license": "Apache-2.0"
    },
    "node_modules/electron-to-chromium": {
      "version": "1.5.451",
      "resolved": "https://registry.npmjs.org/electron-to-chromium/-/electron-to-chromium-1.5.451.tgz",
      "integrity": "sha512-vUNKPrUzw8ByEMOxloq0a71iD/mPuPxVkbDm3G5YhnxTzOw/I6qAg2MUS0cYj/c267lWmw26yW4Vv7foxTxPLg==",
      "dev": true,
      "license": "ISC"
    },
    "node_modules/esbuild": {
      "version": "0.25.12",
      "resolved": "https://registry.npmjs.org/esbuild/-/esbuild-0.25.12.tgz",
      "integrity": "sha512-bbPBYYrtZbkt6Os6FiTLCTFxvq4tt3JKall1vRwshA3fdVztsLAatFaZobhkBC8/BrPetoa0oksYoKXoG4ryJg==",
      "dev": true,
      "hasInstallScript": true,
      "license": "MIT",
      "bin": {
        "esbuild": "bin/esbuild"
      },
      "engines": {
        "node": ">=18"
      },
      "optionalDependencies": {
        "@esbuild/aix-ppc64": "0.25.12",
        "@esbuild/android-arm": "0.25.12",
        "@esbuild/android-arm64": "0.25.12",
        "@esbuild/android-x64": "0.25.12",
        "@esbuild/darwin-arm64": "0.25.12",
        "@esbuild/darwin-x64": "0.25.12",
        "@esbuild/freebsd-arm64": "0.25.12",
        "@esbuild/freebsd-x64": "0.25.12",
        "@esbuild/linux-arm": "0.25.12",
        "@esbuild/linux-arm64": "0.25.12",
        "@esbuild/linux-ia32": "0.25.12",
        "@esbuild/linux-loong64": "0.25.12",
        "@esbuild/linux-mips64el": "0.25.12",
        "@esbuild/linux-ppc64": "0.25.12",
        "@esbuild/linux-riscv64": "0.25.12",
        "@esbuild/linux-s390x": "0.25.12",
        "@esbuild/linux-x64": "0.25.12",
        "@esbuild/netbsd-arm64": "0.25.12",
        "@esbuild/netbsd-x64": "0.25.12",
        "@esbuild/openbsd-arm64": "0.25.12",
        "@esbuild/openbsd-x64": "0.25.12",
        "@esbuild/openharmony-arm64": "0.25.12",
        "@esbuild/sunos-x64": "0.25.12",
        "@esbuild/win32-arm64": "0.25.12",
        "@esbuild/win32-ia32": "0.25.12",
        "@esbuild/win32-x64": "0.25.12"
      }
    },
    "node_modules/escalade": {
      "version": "3.2.0",
      "resolved": "https://registry.npmjs.org/escalade/-/escalade-3.2.0.tgz",
      "integrity": "sha512-WUj2qlxaQtO4g6Pq5c29GTcWGDyd8itL8zTlipgECz3JesAiiOKotd8JU6otB3PACgG6xkJUyVhboMS+bje/jA==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=6"
      }
    },
    "node_modules/extend-shallow": {
      "version": "2.0.1",
      "resolved": "https://registry.npmjs.org/extend-shallow/-/extend-shallow-2.0.1.tgz",
      "integrity": "sha512-zCnTtlxNoAiDc3gqY2aYAWFx7XWWiasuF2K8Me5WbN8otHKTUKBwjPtNpRs/rbUZm7KxWAaNj7P1a/p52GbVug==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "is-extendable": "^0.1.0"
      },
      "engines": {
        "node": ">=0.10.0"
      }
    },
    "node_modules/extend-shallow/node_modules/is-extendable": {
      "version": "0.1.1",
      "resolved": "https://registry.npmjs.org/is-extendable/-/is-extendable-0.1.1.tgz",
      "integrity": "sha512-5BMULNob1vgFX6EjQw5izWDxrecWK9AM72rugNr0TFldMOi0fj6Jk+zeKIt0xGj4cEfQIJth4w3OKWOJ4f+AFw==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=0.10.0"
      }
    },
    "node_modules/fdir": {
      "version": "6.5.0",
      "resolved": "https://registry.npmjs.org/fdir/-/fdir-6.5.0.tgz",
      "integrity": "sha512-tIbYtZbucOs0BRGqPJkshJUYdL+SDH7dVM8gjy+ERp3WAUjLEFJE+02kanyHtwjWOnwrKYBiwAmM0p4kLJAnXg==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=12.0.0"
      },
      "peerDependencies": {
        "picomatch": "^3 || ^4"
      },
      "peerDependenciesMeta": {
        "picomatch": {
          "optional": true
        }
      }
    },
    "node_modules/fflate": {
      "version": "0.8.3",
      "resolved": "https://registry.npmjs.org/fflate/-/fflate-0.8.3.tgz",
      "integrity": "sha512-tbZNuJrLwGUp3zshBtdy4W+ORxZuIh8a5ilyIEQDC5rY1f3U20JMry0Ll3WBzU58EZKsEuJFXhb5gwv8CsPvgA==",
      "license": "MIT"
    },
    "node_modules/file-selector": {
      "version": "0.5.0",
      "resolved": "https://registry.npmjs.org/file-selector/-/file-selector-0.5.0.tgz",
      "integrity": "sha512-s8KNnmIDTBoD0p9uJ9uD0XY38SCeBOtj0UMXyQSLg1Ypfrfj8+dAvwsLjYQkQ2GjhVtp2HrnF5cJzMhBjfD8HA==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "tslib": "^2.0.3"
      },
      "engines": {
        "node": ">= 10"
      }
    },
    "node_modules/for-in": {
      "version": "1.0.2",
      "resolved": "https://registry.npmjs.org/for-in/-/for-in-1.0.2.tgz",
      "integrity": "sha512-7EwmXrOjyL+ChxMhmG5lnW9MPt1aIeZEwKhQzoBUdTV0N3zuwWDZYVJatDvZ2OyzPUvdIAZDsCetk3coyMfcnQ==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=0.10.0"
      }
    },
    "node_modules/fsevents": {
      "version": "2.3.3",
      "resolved": "https://registry.npmjs.org/fsevents/-/fsevents-2.3.3.tgz",
      "integrity": "sha512-5xoDfX+fL7faATnagmWPpbFtwh/R77WmMMqqHGS65C3vvB0YHrgF+B1YmZ3441tMj5n63k0212XNoJwzlhffQw==",
      "dev": true,
      "hasInstallScript": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "darwin"
      ],
      "engines": {
        "node": "^8.16.0 || ^10.6.0 || >=11.0.0"
      }
    },
    "node_modules/gensync": {
      "version": "1.0.0-beta.2",
      "resolved": "https://registry.npmjs.org/gensync/-/gensync-1.0.0-beta.2.tgz",
      "integrity": "sha512-3hN7NaskYvMDLQY55gnW3NQ+mesEAepTqlg+VEbj7zzqEMBVNhzcGYYeqFo/TlYz6eQiFcp1HcsCZO+nGgS8zg==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=6.9.0"
      }
    },
    "node_modules/get-value": {
      "version": "2.0.6",
      "resolved": "https://registry.npmjs.org/get-value/-/get-value-2.0.6.tgz",
      "integrity": "sha512-Ln0UQDlxH1BapMu3GPtf7CuYNwRZf2gwCuPqbyG6pB8WfmFpzqcy4xtAaAMUhnNqjMKTiCPZG2oMT3YSx8U2NA==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=0.10.0"
      }
    },
    "node_modules/glsl-noise": {
      "version": "0.0.0",
      "resolved": "https://registry.npmjs.org/glsl-noise/-/glsl-noise-0.0.0.tgz",
      "integrity": "sha512-b/ZCF6amfAUb7dJM/MxRs7AetQEahYzJ8PtgfrmEdtw6uyGOr+ZSGtgjFm6mfsBkxJ4d2W7kg+Nlqzqvn3Bc0w==",
      "license": "MIT"
    },
    "node_modules/hls.js": {
      "version": "1.7.3",
      "resolved": "https://registry.npmjs.org/hls.js/-/hls.js-1.7.3.tgz",
      "integrity": "sha512-MsPlx6yVW4Qv4C7mEVou4/gk/5cN2dVxOTnrNjPSmyH2f0Ln+/UkG10Ax1PE6OvrmTVPKgQYozTtBaPOuCzq7A==",
      "license": "Apache-2.0"
    },
    "node_modules/ieee754": {
      "version": "1.2.1",
      "resolved": "https://registry.npmjs.org/ieee754/-/ieee754-1.2.1.tgz",
      "integrity": "sha512-dcyqhDvX1C46lXZcVqCpK+FtMRQVdIMN6/Df5js2zouUsqG7I6sFxitIC+7KYK29KdXOLHdu9zL4sFnoVQnqaA==",
      "funding": [
        {
          "type": "github",
          "url": "https://github.com/sponsors/feross"
        },
        {
          "type": "patreon",
          "url": "https://www.patreon.com/feross"
        },
        {
          "type": "consulting",
          "url": "https://feross.org/support"
        }
      ],
      "license": "BSD-3-Clause"
    },
    "node_modules/immediate": {
      "version": "3.0.6",
      "resolved": "https://registry.npmjs.org/immediate/-/immediate-3.0.6.tgz",
      "integrity": "sha512-XXOFtyqDjNDAQxVfYxuF7g9Il/IbWmmlQg2MYKOH8ExIT1qg6xc4zyS3HaEEATgs1btfzxq15ciUiY7gjSXRGQ==",
      "license": "MIT"
    },
    "node_modules/is-extendable": {
      "version": "1.0.1",
      "resolved": "https://registry.npmjs.org/is-extendable/-/is-extendable-1.0.1.tgz",
      "integrity": "sha512-arnXMxT1hhoKo9k1LZdmlNyJdDDfy2v0fXjFlmok4+i8ul/6WlbVge9bhM74OpNPQPMGUToDtz+KXa1PneJxOA==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "is-plain-object": "^2.0.4"
      },
      "engines": {
        "node": ">=0.10.0"
      }
    },
    "node_modules/is-plain-object": {
      "version": "2.0.4",
      "resolved": "https://registry.npmjs.org/is-plain-object/-/is-plain-object-2.0.4.tgz",
      "integrity": "sha512-h5PpgXkWitc38BBMYawTYMWJHFZJVnBquFE57xFpjB8pJFiF6gZ+bU+WyI/yqXiFR5mdLsgYNaPe8uao6Uv9Og==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "isobject": "^3.0.1"
      },
      "engines": {
        "node": ">=0.10.0"
      }
    },
    "node_modules/is-promise": {
      "version": "2.2.2",
      "resolved": "https://registry.npmjs.org/is-promise/-/is-promise-2.2.2.tgz",
      "integrity": "sha512-+lP4/6lKUBfQjZ2pdxThZvLUAafmZb8OAxFb8XXtiQmS35INgr85hdOGoEs124ez1FCnZJt6jau/T+alh58QFQ==",
      "license": "MIT"
    },
    "node_modules/isexe": {
      "version": "2.0.0",
      "resolved": "https://registry.npmjs.org/isexe/-/isexe-2.0.0.tgz",
      "integrity": "sha512-RHxMLp9lnKHGHRng9QFhRCMbYAcVpn69smSGcq3f36xjgVVWThj4qqLbTLlq7Ssj8B+fIQ1EuCEGI2lKsyQeIw==",
      "license": "ISC"
    },
    "node_modules/isobject": {
      "version": "3.0.1",
      "resolved": "https://registry.npmjs.org/isobject/-/isobject-3.0.1.tgz",
      "integrity": "sha512-WhB9zCku7EGTj/HQQRz5aUQEUeoQZH2bWcltRErOpymJ4boYE6wL9Tbr23krRPSZ+C5zqNSrSw+Cc7sZZ4b7vg==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=0.10.0"
      }
    },
    "node_modules/its-fine": {
      "version": "1.2.5",
      "resolved": "https://registry.npmjs.org/its-fine/-/its-fine-1.2.5.tgz",
      "integrity": "sha512-fXtDA0X0t0eBYAGLVM5YsgJGsJ5jEmqZEPrGbzdf5awjv0xE7nqv3TVnvtUF060Tkes15DbDAKW/I48vsb6SyA==",
      "license": "MIT",
      "dependencies": {
        "@types/react-reconciler": "^0.28.0"
      },
      "peerDependencies": {
        "react": ">=18.0"
      }
    },
    "node_modules/its-fine/node_modules/@types/react-reconciler": {
      "version": "0.28.9",
      "resolved": "https://registry.npmjs.org/@types/react-reconciler/-/react-reconciler-0.28.9.tgz",
      "integrity": "sha512-HHM3nxyUZ3zAylX8ZEyrDNd2XZOnQ0D5XfunJF5FLQnZbHHYq4UWvW1QfelQNXv1ICNkwYhfxjwfnqivYB6bFg==",
      "license": "MIT",
      "peerDependencies": {
        "@types/react": "*"
      }
    },
    "node_modules/js-tokens": {
      "version": "4.0.0",
      "resolved": "https://registry.npmjs.org/js-tokens/-/js-tokens-4.0.0.tgz",
      "integrity": "sha512-RdJUflcE3cUzKiMqQgsCu06FPu9UdIJO0beYbPhHN4k6apgJtifcoCtT9bcxOpYBtpD2kCM6Sbzg4CausW/PKQ==",
      "license": "MIT"
    },
    "node_modules/jsesc": {
      "version": "3.1.0",
      "resolved": "https://registry.npmjs.org/jsesc/-/jsesc-3.1.0.tgz",
      "integrity": "sha512-/sM3dO2FOzXjKQhJuo0Q173wf2KOo8t4I8vHy6lF9poUp7bKT0/NHE8fPX23PwfhnykfqnC2xRxOnVw5XuGIaA==",
      "dev": true,
      "license": "MIT",
      "bin": {
        "jsesc": "bin/jsesc"
      },
      "engines": {
        "node": ">=6"
      }
    },
    "node_modules/json5": {
      "version": "2.2.3",
      "resolved": "https://registry.npmjs.org/json5/-/json5-2.2.3.tgz",
      "integrity": "sha512-XmOWe7eyHYH14cLdVPoyg+GOH3rYX++KpzrylJwSW98t3Nk+U8XOl8FWKOgwtzdb8lXGf6zYwDUzeHMWfxasyg==",
      "dev": true,
      "license": "MIT",
      "bin": {
        "json5": "lib/cli.js"
      },
      "engines": {
        "node": ">=6"
      }
    },
    "node_modules/leva": {
      "version": "0.10.0",
      "resolved": "https://registry.npmjs.org/leva/-/leva-0.10.0.tgz",
      "integrity": "sha512-RiNJWmeqQdKIeHuVXgshmxIHu144a2AMYtLxKf8Nm1j93pisDPexuQDHKNdQlbo37wdyDQibLjY9JKGIiD7gaw==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@radix-ui/react-portal": "1.0.2",
        "@radix-ui/react-tooltip": "1.0.5",
        "@stitches/react": "^1.2.8",
        "@use-gesture/react": "^10.2.5",
        "colord": "^2.9.2",
        "dequal": "^2.0.2",
        "merge-value": "^1.0.0",
        "react-colorful": "^5.5.1",
        "react-dropzone": "^12.0.0",
        "v8n": "^1.3.3",
        "zustand": "^3.6.9"
      },
      "peerDependencies": {
        "react": "^18.0.0 || ^19.0.0",
        "react-dom": "^18.0.0 || ^19.0.0"
      }
    },
    "node_modules/leva/node_modules/zustand": {
      "version": "3.7.2",
      "resolved": "https://registry.npmjs.org/zustand/-/zustand-3.7.2.tgz",
      "integrity": "sha512-PIJDIZKtokhof+9+60cpockVOq05sJzHCriyvaLBmEJixseQ1a5Kdov6fWZfWOu5SK9c+FhH1jU0tntLxRJYMA==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=12.7.0"
      },
      "peerDependencies": {
        "react": ">=16.8"
      },
      "peerDependenciesMeta": {
        "react": {
          "optional": true
        }
      }
    },
    "node_modules/lie": {
      "version": "3.3.0",
      "resolved": "https://registry.npmjs.org/lie/-/lie-3.3.0.tgz",
      "integrity": "sha512-UaiMJzeWRlEujzAuw5LokY1L5ecNQYZKfmyZ9L7wDHb/p5etKaxXhohBcrw0EYby+G/NA52vRSN4N39dxHAIwQ==",
      "license": "MIT",
      "dependencies": {
        "immediate": "~3.0.5"
      }
    },
    "node_modules/loose-envify": {
      "version": "1.4.0",
      "resolved": "https://registry.npmjs.org/loose-envify/-/loose-envify-1.4.0.tgz",
      "integrity": "sha512-lyuxPGr/Wfhrlem2CL/UcnUc1zcqKAImBDzukY7Y5F/yQiNdko6+fRLevlw1HgMySw7f611UIY408EtxRSoK3Q==",
      "license": "MIT",
      "dependencies": {
        "js-tokens": "^3.0.0 || ^4.0.0"
      },
      "bin": {
        "loose-envify": "cli.js"
      }
    },
    "node_modules/lru-cache": {
      "version": "5.1.1",
      "resolved": "https://registry.npmjs.org/lru-cache/-/lru-cache-5.1.1.tgz",
      "integrity": "sha512-KpNARQA3Iwv+jTA0utUVVbrh+Jlrr1Fv0e56GGzAFOXN7dk/FviaDW8LHmK52DlcH4WP2n6gI8vN1aesBFgo9w==",
      "dev": true,
      "license": "ISC",
      "dependencies": {
        "yallist": "^3.0.2"
      }
    },
    "node_modules/maath": {
      "version": "0.10.8",
      "resolved": "https://registry.npmjs.org/maath/-/maath-0.10.8.tgz",
      "integrity": "sha512-tRvbDF0Pgqz+9XUa4jjfgAQ8/aPKmQdWXilFu2tMy4GWj4NOsx99HlULO4IeREfbO3a0sA145DZYyvXPkybm0g==",
      "license": "MIT",
      "peerDependencies": {
        "@types/three": ">=0.134.0",
        "three": ">=0.134.0"
      }
    },
    "node_modules/merge-value": {
      "version": "1.0.0",
      "resolved": "https://registry.npmjs.org/merge-value/-/merge-value-1.0.0.tgz",
      "integrity": "sha512-fJMmvat4NeKz63Uv9iHWcPDjCWcCkoiRoajRTEO8hlhUC6rwaHg0QCF9hBOTjZmm4JuglPckPSTtcuJL5kp0TQ==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "get-value": "^2.0.6",
        "is-extendable": "^1.0.0",
        "mixin-deep": "^1.2.0",
        "set-value": "^2.0.0"
      },
      "engines": {
        "node": ">=0.10.0"
      }
    },
    "node_modules/meshline": {
      "version": "3.3.1",
      "resolved": "https://registry.npmjs.org/meshline/-/meshline-3.3.1.tgz",
      "integrity": "sha512-/TQj+JdZkeSUOl5Mk2J7eLcYTLiQm2IDzmlSvYm7ov15anEcDJ92GHqqazxTSreeNgfnYu24kiEvvv0WlbCdFQ==",
      "license": "MIT",
      "peerDependencies": {
        "three": ">=0.137"
      }
    },
    "node_modules/meshoptimizer": {
      "version": "0.18.1",
      "resolved": "https://registry.npmjs.org/meshoptimizer/-/meshoptimizer-0.18.1.tgz",
      "integrity": "sha512-ZhoIoL7TNV4s5B6+rx5mC//fw8/POGyNxS/DZyCJeiZ12ScLfVwRE/GfsxwiTkMYYD5DmK2/JXnEVXqL4rF+Sw==",
      "license": "MIT"
    },
    "node_modules/mixin-deep": {
      "version": "1.3.2",
      "resolved": "https://registry.npmjs.org/mixin-deep/-/mixin-deep-1.3.2.tgz",
      "integrity": "sha512-WRoDn//mXBiJ1H40rqa3vH0toePwSsGb45iInWlTySa+Uu4k3tYUSxa2v1KqAiLtvlrSzaExqS1gtk96A9zvEA==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "for-in": "^1.0.2",
        "is-extendable": "^1.0.1"
      },
      "engines": {
        "node": ">=0.10.0"
      }
    },
    "node_modules/ms": {
      "version": "2.1.3",
      "resolved": "https://registry.npmjs.org/ms/-/ms-2.1.3.tgz",
      "integrity": "sha512-6FlzubTLZG3J2a/NVCAleEhjzq5oxgHyaCU9yYXvcLsvoVaHJq/s5xXI6/XXP6tz7R9xAOtHnSO/tXtF3WRTlA==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/n8ao": {
      "version": "1.10.3",
      "resolved": "https://registry.npmjs.org/n8ao/-/n8ao-1.10.3.tgz",
      "integrity": "sha512-JFRk4WgUAUWO2KdJTqmBT02dP9kG7rE2oQbBy64E9+YwQ3d96KB9QBanqNy/NnYUfUTYU6Z/5OS5t/yLey7+6Q==",
      "license": "ISC",
      "peerDependencies": {
        "postprocessing": ">=6.30.0",
        "three": ">=0.137"
      }
    },
    "node_modules/nanoid": {
      "version": "3.3.20",
      "resolved": "https://registry.npmjs.org/nanoid/-/nanoid-3.3.20.tgz",
      "integrity": "sha512-uKdg2G3GNCKQn9byYOpxbGqrT2fGO5KRt5J/8b3pok8rT6qxGWF6hxMyJiEYtAf+FVyYuD9hRaDqX5uPFYJ4ZQ==",
      "dev": true,
      "funding": [
        {
          "type": "github",
          "url": "https://github.com/sponsors/ai"
        }
      ],
      "license": "MIT",
      "bin": {
        "nanoid": "bin/nanoid.cjs"
      },
      "engines": {
        "node": "^10 || ^12 || ^13.7 || ^14 || >=15.0.1"
      }
    },
    "node_modules/node-releases": {
      "version": "2.0.58",
      "resolved": "https://registry.npmjs.org/node-releases/-/node-releases-2.0.58.tgz",
      "integrity": "sha512-BdiKAgbfRlvfMq/XzO/AF9NPmaA8a+YpLAyAFTVFBj3gARrAIfWvNq7Q7NE4se3KgFu0KkrvQMxTS0XVnsGzHg==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/object-assign": {
      "version": "4.1.1",
      "resolved": "https://registry.npmjs.org/object-assign/-/object-assign-4.1.1.tgz",
      "integrity": "sha512-rJgTQnkUnH1sFw8yT6VSU3zD3sWmu6sZhIseY8VX+GRu3P6F7Fu+JNDoXfklElbLJSnc3FUQHVe4cU5hj+BcUg==",
      "license": "MIT",
      "engines": {
        "node": ">=0.10.0"
      }
    },
    "node_modules/path-key": {
      "version": "3.1.1",
      "resolved": "https://registry.npmjs.org/path-key/-/path-key-3.1.1.tgz",
      "integrity": "sha512-ojmeN0qd+y0jszEtoY48r0Peq5dwMEkIlCOu6Q5f41lfkswXuKtYrhgoTpLnyIcHm24Uhqx+5Tqm2InSwLhE6Q==",
      "license": "MIT",
      "engines": {
        "node": ">=8"
      }
    },
    "node_modules/picocolors": {
      "version": "1.1.1",
      "resolved": "https://registry.npmjs.org/picocolors/-/picocolors-1.1.1.tgz",
      "integrity": "sha512-xceH2snhtb5M9liqDsmEw56le376mTZkEX/jEb/RxNFyegNul7eNslCXP9FDj/Lcu0X8KEyMceP2ntpaHrDEVA==",
      "dev": true,
      "license": "ISC"
    },
    "node_modules/picomatch": {
      "version": "4.0.7",
      "resolved": "https://registry.npmjs.org/picomatch/-/picomatch-4.0.7.tgz",
      "integrity": "sha512-qcJu88Q2IWqJsDD529JKMdwGm/dvInW4HvQnRwiH9JtihJvzGOscDtHE3x1pBKeUOTysQ8kVmLnJ2kJu7yhcGA==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=12"
      },
      "funding": {
        "url": "https://github.com/sponsors/jonschlinkert"
      }
    },
    "node_modules/playwright": {
      "version": "1.64.0",
      "resolved": "https://registry.npmjs.org/playwright/-/playwright-1.64.0.tgz",
      "integrity": "sha512-kVzTnYFYEyQ9RGzBjNCd2+yEqWmVbxl3AHPynv3qQ6JTjv4a+kwRcnqQwIpuP3NnrnIrE/Q6wWAIAvMfIE2/Yg==",
      "dev": true,
      "license": "Apache-2.0",
      "dependencies": {
        "playwright-core": "1.64.0"
      },
      "bin": {
        "playwright": "cli.js"
      },
      "engines": {
        "node": ">=20"
      }
    },
    "node_modules/playwright-core": {
      "version": "1.64.0",
      "resolved": "https://registry.npmjs.org/playwright-core/-/playwright-core-1.64.0.tgz",
      "integrity": "sha512-T9r+MZkTECl2+oUcZ26YgZzTrYidTsIhYYkJix+6iDOymOb1FB2RLLSOxRGnZGv5DStt+aduIVbt+E8WygXYpg==",
      "dev": true,
      "license": "Apache-2.0",
      "bin": {
        "playwright-core": "cli.js"
      },
      "engines": {
        "node": ">=20"
      }
    },
    "node_modules/postcss": {
      "version": "8.5.29",
      "resolved": "https://registry.npmjs.org/postcss/-/postcss-8.5.29.tgz",
      "integrity": "sha512-49cGhUbXj8Qenv0iTMxA1cFBzxXoctpC9Ujd77t1WcbJIr6nF/eI7g/8MgxrYldFRuAXvja7xQRwavoW7kgrxQ==",
      "dev": true,
      "funding": [
        {
          "type": "opencollective",
          "url": "https://opencollective.com/postcss/"
        },
        {
          "type": "tidelift",
          "url": "https://tidelift.com/funding/github/npm/postcss"
        },
        {
          "type": "github",
          "url": "https://github.com/sponsors/ai"
        }
      ],
      "license": "MIT",
      "dependencies": {
        "nanoid": "^3.3.19",
        "picocolors": "^1.1.1",
        "source-map-js": "^1.2.2"
      },
      "engines": {
        "node": "^10 || ^12 || >=14"
      }
    },
    "node_modules/postprocessing": {
      "version": "6.39.5",
      "resolved": "https://registry.npmjs.org/postprocessing/-/postprocessing-6.39.5.tgz",
      "integrity": "sha512-YmH+t74J2X1lwYjKzK/tgs9C9kqWWPB9JwZiDF5mEf4BdCEAmEFbO8lXBA7NM0/j4g+x6FgD/Tt5/kT7ogbEDA==",
      "license": "Zlib",
      "peerDependencies": {
        "three": ">= 0.168.0 < 0.187.0"
      }
    },
    "node_modules/potpack": {
      "version": "1.0.2",
      "resolved": "https://registry.npmjs.org/potpack/-/potpack-1.0.2.tgz",
      "integrity": "sha512-choctRBIV9EMT9WGAZHn3V7t0Z2pMQyl0EZE6pFc/6ml3ssw7Dlf/oAOvFwjm1HVsqfQN8GfeFyJ+d8tRzqueQ==",
      "license": "ISC"
    },
    "node_modules/prettier": {
      "version": "3.9.9",
      "resolved": "https://registry.npmjs.org/prettier/-/prettier-3.9.9.tgz",
      "integrity": "sha512-Z/CJHIkdujO/OtN7nXUii0Rf3VT5SRuhjBA82Xvu2XhBUgX3nhP67T0LHceBdQLex7OOFGTox+Q5Yg8Jk2Qivg==",
      "dev": true,
      "license": "MIT",
      "bin": {
        "prettier": "bin/prettier.cjs"
      },
      "engines": {
        "node": ">=14"
      },
      "funding": {
        "url": "https://github.com/prettier/prettier?sponsor=1"
      }
    },
    "node_modules/promise-worker-transferable": {
      "version": "1.0.4",
      "resolved": "https://registry.npmjs.org/promise-worker-transferable/-/promise-worker-transferable-1.0.4.tgz",
      "integrity": "sha512-bN+0ehEnrXfxV2ZQvU2PetO0n4gqBD4ulq3MI1WOPLgr7/Mg9yRQkX5+0v1vagr74ZTsl7XtzlaYDo2EuCeYJw==",
      "license": "Apache-2.0",
      "dependencies": {
        "is-promise": "^2.1.0",
        "lie": "^3.0.2"
      }
    },
    "node_modules/prop-types": {
      "version": "15.8.1",
      "resolved": "https://registry.npmjs.org/prop-types/-/prop-types-15.8.1.tgz",
      "integrity": "sha512-oj87CgZICdulUohogVAR7AjlC0327U4el4L6eAvOqCeudMDVU0NThNaV+b9Df4dXgSP1gXMTnPdhfe/2qDH5cg==",
      "license": "MIT",
      "dependencies": {
        "loose-envify": "^1.4.0",
        "object-assign": "^4.1.1",
        "react-is": "^16.13.1"
      }
    },
    "node_modules/react": {
      "version": "18.3.1",
      "resolved": "https://registry.npmjs.org/react/-/react-18.3.1.tgz",
      "integrity": "sha512-wS+hAgJShR0KhEvPJArfuPVN1+Hz1t0Y6n5jLrGQbkb4urgPE/0Rve+1kMB1v/oWgHgm4WIcV+i7F2pTVj+2iQ==",
      "license": "MIT",
      "dependencies": {
        "loose-envify": "^1.1.0"
      },
      "engines": {
        "node": ">=0.10.0"
      }
    },
    "node_modules/react-colorful": {
      "version": "5.8.1",
      "resolved": "https://registry.npmjs.org/react-colorful/-/react-colorful-5.8.1.tgz",
      "integrity": "sha512-oz68bhsnFWnpDf1ZR8daiQbYpXUnM2h2J6hl9Zg2rTpM/DU6vCqe1E+CpqmqLnJucMZetHZeifSAfJ+geN9lcA==",
      "dev": true,
      "license": "MIT",
      "peerDependencies": {
        "react": ">=16.8.0",
        "react-dom": ">=16.8.0"
      }
    },
    "node_modules/react-composer": {
      "version": "5.0.3",
      "resolved": "https://registry.npmjs.org/react-composer/-/react-composer-5.0.3.tgz",
      "integrity": "sha512-1uWd07EME6XZvMfapwZmc7NgCZqDemcvicRi3wMJzXsQLvZ3L7fTHVyPy1bZdnWXM4iPjYuNE+uJ41MLKeTtnA==",
      "license": "MIT",
      "dependencies": {
        "prop-types": "^15.6.0"
      },
      "peerDependencies": {
        "react": "^15.0.0 || ^16.0.0 || ^17.0.0 || ^18.0.0"
      }
    },
    "node_modules/react-dom": {
      "version": "18.3.1",
      "resolved": "https://registry.npmjs.org/react-dom/-/react-dom-18.3.1.tgz",
      "integrity": "sha512-5m4nQKp+rZRb09LNH59GM4BxTh9251/ylbKIbpe7TpGxfJ+9kv6BLkLBXIjjspbgbnIBNqlI23tRnTWT0snUIw==",
      "license": "MIT",
      "dependencies": {
        "loose-envify": "^1.1.0",
        "scheduler": "^0.23.2"
      },
      "peerDependencies": {
        "react": "^18.3.1"
      }
    },
    "node_modules/react-dom/node_modules/scheduler": {
      "version": "0.23.2",
      "resolved": "https://registry.npmjs.org/scheduler/-/scheduler-0.23.2.tgz",
      "integrity": "sha512-UOShsPwz7NrMUqhR6t0hWjFduvOzbtv7toDH1/hIrfRNIDBnnBWd0CwJTGvTpngVlmwGCdP9/Zl/tVrDqcuYzQ==",
      "license": "MIT",
      "dependencies": {
        "loose-envify": "^1.1.0"
      }
    },
    "node_modules/react-dropzone": {
      "version": "12.1.0",
      "resolved": "https://registry.npmjs.org/react-dropzone/-/react-dropzone-12.1.0.tgz",
      "integrity": "sha512-iBYHA1rbopIvtzokEX4QubO6qk5IF/x3BtKGu74rF2JkQDXnwC4uO/lHKpaw4PJIV6iIAYOlwLv2FpiGyqHNog==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "attr-accept": "^2.2.2",
        "file-selector": "^0.5.0",
        "prop-types": "^15.8.1"
      },
      "engines": {
        "node": ">= 10.13"
      },
      "peerDependencies": {
        "react": ">= 16.8"
      }
    },
    "node_modules/react-is": {
      "version": "16.13.1",
      "resolved": "https://registry.npmjs.org/react-is/-/react-is-16.13.1.tgz",
      "integrity": "sha512-24e6ynE2H+OKt4kqsOvNd8kBpV65zoxbA4BVsEOB3ARVWQki/DHzaUoC5KuON/BiccDaCCTZBuOcfZs70kR8bQ==",
      "license": "MIT"
    },
    "node_modules/react-reconciler": {
      "version": "0.27.0",
      "resolved": "https://registry.npmjs.org/react-reconciler/-/react-reconciler-0.27.0.tgz",
      "integrity": "sha512-HmMDKciQjYmBRGuuhIaKA1ba/7a+UsM5FzOZsMO2JYHt9Jh8reCb7j1eDC95NOyUlKM9KRyvdx0flBuDvYSBoA==",
      "license": "MIT",
      "dependencies": {
        "loose-envify": "^1.1.0",
        "scheduler": "^0.21.0"
      },
      "engines": {
        "node": ">=0.10.0"
      },
      "peerDependencies": {
        "react": "^18.0.0"
      }
    },
    "node_modules/react-refresh": {
      "version": "0.17.0",
      "resolved": "https://registry.npmjs.org/react-refresh/-/react-refresh-0.17.0.tgz",
      "integrity": "sha512-z6F7K9bV85EfseRCp2bzrpyQ0Gkw1uLoCel9XBVWPg/TjRj94SkJzUTGfOa4bs7iJvBWtQG0Wq7wnI0syw3EBQ==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=0.10.0"
      }
    },
    "node_modules/react-use-measure": {
      "version": "2.1.7",
      "resolved": "https://registry.npmjs.org/react-use-measure/-/react-use-measure-2.1.7.tgz",
      "integrity": "sha512-KrvcAo13I/60HpwGO5jpW7E9DfusKyLPLvuHlUyP5zqnmAPhNc6qTRjUQrdTADl0lpPpDVU2/Gg51UlOGHXbdg==",
      "license": "MIT",
      "peerDependencies": {
        "react": ">=16.13",
        "react-dom": ">=16.13"
      },
      "peerDependenciesMeta": {
        "react-dom": {
          "optional": true
        }
      }
    },
    "node_modules/require-from-string": {
      "version": "2.0.2",
      "resolved": "https://registry.npmjs.org/require-from-string/-/require-from-string-2.0.2.tgz",
      "integrity": "sha512-Xf0nWe6RseziFMu+Ap9biiUbmplq6S9/p+7w7YXP/JBHhrUDDUhwa+vANyubuqfZWTveU//DYVGsDG7RKL/vEw==",
      "license": "MIT",
      "engines": {
        "node": ">=0.10.0"
      }
    },
    "node_modules/rollup": {
      "version": "4.64.3",
      "resolved": "https://registry.npmjs.org/rollup/-/rollup-4.64.3.tgz",
      "integrity": "sha512-iIMWbptLYsZdGTJMH8ngApXdsCatE6bCMv2eqGIfGE1++kwh7TCWBdWKK0FKC0yx++196vGK5VdagzRXSLMa8A==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@types/estree": "1.0.9"
      },
      "bin": {
        "rollup": "dist/bin/rollup"
      },
      "engines": {
        "node": ">=18.0.0",
        "npm": ">=8.0.0"
      },
      "optionalDependencies": {
        "@napi-rs/lzma-linux-x64-gnu": "1.5.1",
        "@rollup/rollup-android-arm-eabi": "4.64.3",
        "@rollup/rollup-android-arm64": "4.64.3",
        "@rollup/rollup-darwin-arm64": "4.64.3",
        "@rollup/rollup-darwin-x64": "4.64.3",
        "@rollup/rollup-freebsd-arm64": "4.64.3",
        "@rollup/rollup-freebsd-x64": "4.64.3",
        "@rollup/rollup-linux-arm-gnueabihf": "4.64.3",
        "@rollup/rollup-linux-arm-musleabihf": "4.64.3",
        "@rollup/rollup-linux-arm64-gnu": "4.64.3",
        "@rollup/rollup-linux-arm64-musl": "4.64.3",
        "@rollup/rollup-linux-loong64-gnu": "4.64.3",
        "@rollup/rollup-linux-loong64-musl": "4.64.3",
        "@rollup/rollup-linux-ppc64-gnu": "4.64.3",
        "@rollup/rollup-linux-ppc64-musl": "4.64.3",
        "@rollup/rollup-linux-riscv64-gnu": "4.64.3",
        "@rollup/rollup-linux-riscv64-musl": "4.64.3",
        "@rollup/rollup-linux-s390x-gnu": "4.64.3",
        "@rollup/rollup-linux-x64-gnu": "4.64.3",
        "@rollup/rollup-linux-x64-musl": "4.64.3",
        "@rollup/rollup-openbsd-x64": "4.64.3",
        "@rollup/rollup-openharmony-arm64": "4.64.3",
        "@rollup/rollup-win32-arm64-msvc": "4.64.3",
        "@rollup/rollup-win32-ia32-msvc": "4.64.3",
        "@rollup/rollup-win32-x64-gnu": "4.64.3",
        "@rollup/rollup-win32-x64-msvc": "4.64.3",
        "fsevents": "~2.3.2"
      }
    },
    "node_modules/scheduler": {
      "version": "0.21.0",
      "resolved": "https://registry.npmjs.org/scheduler/-/scheduler-0.21.0.tgz",
      "integrity": "sha512-1r87x5fz9MXqswA2ERLo0EbOAU74DpIUO090gIasYTqlVoJeMcl+Z1Rg7WHz+qtPujhS/hGIt9kxZOYBV3faRQ==",
      "license": "MIT",
      "dependencies": {
        "loose-envify": "^1.1.0"
      }
    },
    "node_modules/semver": {
      "version": "6.3.1",
      "resolved": "https://registry.npmjs.org/semver/-/semver-6.3.1.tgz",
      "integrity": "sha512-BR7VvDCVHO+q2xBEWskxS6DJE1qRnb7DxzUrogb71CWoSficBxYsiAGd+Kl0mmq/MprG9yArRkyrQxTO6XjMzA==",
      "dev": true,
      "license": "ISC",
      "bin": {
        "semver": "bin/semver.js"
      }
    },
    "node_modules/set-value": {
      "version": "2.0.1",
      "resolved": "https://registry.npmjs.org/set-value/-/set-value-2.0.1.tgz",
      "integrity": "sha512-JxHc1weCN68wRY0fhCoXpyK55m/XPHafOmK4UWD7m2CI14GMcFypt4w/0+NV5f/ZMby2F6S2wwA7fgynh9gWSw==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "extend-shallow": "^2.0.1",
        "is-extendable": "^0.1.1",
        "is-plain-object": "^2.0.3",
        "split-string": "^3.0.1"
      },
      "engines": {
        "node": ">=0.10.0"
      }
    },
    "node_modules/set-value/node_modules/is-extendable": {
      "version": "0.1.1",
      "resolved": "https://registry.npmjs.org/is-extendable/-/is-extendable-0.1.1.tgz",
      "integrity": "sha512-5BMULNob1vgFX6EjQw5izWDxrecWK9AM72rugNr0TFldMOi0fj6Jk+zeKIt0xGj4cEfQIJth4w3OKWOJ4f+AFw==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=0.10.0"
      }
    },
    "node_modules/shebang-command": {
      "version": "2.0.0",
      "resolved": "https://registry.npmjs.org/shebang-command/-/shebang-command-2.0.0.tgz",
      "integrity": "sha512-kHxr2zZpYtdmrN1qDjrrX/Z1rR1kG8Dx+gkpK1G4eXmvXswmcE1hTWBWYUzlraYw1/yZp6YuDY77YtvbN0dmDA==",
      "license": "MIT",
      "dependencies": {
        "shebang-regex": "^3.0.0"
      },
      "engines": {
        "node": ">=8"
      }
    },
    "node_modules/shebang-regex": {
      "version": "3.0.0",
      "resolved": "https://registry.npmjs.org/shebang-regex/-/shebang-regex-3.0.0.tgz",
      "integrity": "sha512-7++dFhtcx3353uBaq8DDR4NuxBetBzC7ZQOhmTQInHEd6bSrXdiEyzCvG07Z44UYdLShWUyXt5M/yhz8ekcb1A==",
      "license": "MIT",
      "engines": {
        "node": ">=8"
      }
    },
    "node_modules/source-map-js": {
      "version": "1.2.2",
      "resolved": "https://registry.npmjs.org/source-map-js/-/source-map-js-1.2.2.tgz",
      "integrity": "sha512-KGj/8Y43x35aZVDtt+J4mK1hoLGHULMYfSkODJNQjNDC3oW1PqPoxMwo0pLUsWM/UEGzON/NxeHywEfNXNP3Vw==",
      "dev": true,
      "license": "BSD-3-Clause",
      "engines": {
        "node": ">=0.10.0"
      }
    },
    "node_modules/split-string": {
      "version": "3.1.0",
      "resolved": "https://registry.npmjs.org/split-string/-/split-string-3.1.0.tgz",
      "integrity": "sha512-NzNVhJDYpwceVVii8/Hu6DKfD2G+NrQHlS/V/qgv763EYudVwEcMQNxd2lh+0VrUByXN/oJkl5grOhYWvQUYiw==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "extend-shallow": "^3.0.0"
      },
      "engines": {
        "node": ">=0.10.0"
      }
    },
    "node_modules/split-string/node_modules/extend-shallow": {
      "version": "3.0.2",
      "resolved": "https://registry.npmjs.org/extend-shallow/-/extend-shallow-3.0.2.tgz",
      "integrity": "sha512-BwY5b5Ql4+qZoefgMj2NUmx+tehVTH/Kf4k1ZEtOHNFcm2wSxMRo992l6X3TIgni2eZVTZ85xMOjF31fwZAj6Q==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "assign-symbols": "^1.0.0",
        "is-extendable": "^1.0.1"
      },
      "engines": {
        "node": ">=0.10.0"
      }
    },
    "node_modules/standardized-audio-context": {
      "version": "25.3.77",
      "resolved": "https://registry.npmjs.org/standardized-audio-context/-/standardized-audio-context-25.3.77.tgz",
      "integrity": "sha512-Ki9zNz6pKcC5Pi+QPjPyVsD9GwJIJWgryji0XL9cAJXMGyn+dPOf6Qik1AHei0+UNVcc4BOCa0hWLBzlwqsW/A==",
      "license": "MIT",
      "dependencies": {
        "@babel/runtime": "^7.25.6",
        "automation-events": "^7.0.9",
        "tslib": "^2.7.0"
      }
    },
    "node_modules/stats-gl": {
      "version": "2.4.2",
      "resolved": "https://registry.npmjs.org/stats-gl/-/stats-gl-2.4.2.tgz",
      "integrity": "sha512-g5O9B0hm9CvnM36+v7SFl39T7hmAlv541tU81ME8YeSb3i1CIP5/QdDeSB3A0la0bKNHpxpwxOVRo2wFTYEosQ==",
      "license": "MIT",
      "dependencies": {
        "@types/three": "*",
        "three": "^0.170.0"
      },
      "peerDependencies": {
        "@types/three": "*",
        "three": "*"
      }
    },
    "node_modules/stats.js": {
      "version": "0.17.0",
      "resolved": "https://registry.npmjs.org/stats.js/-/stats.js-0.17.0.tgz",
      "integrity": "sha512-hNKz8phvYLPEcRkeG1rsGmV5ChMjKDAWU7/OJJdDErPBNChQXxCo3WZurGpnWc6gZhAzEPFad1aVgyOANH1sMw==",
      "license": "MIT"
    },
    "node_modules/suspend-react": {
      "version": "0.1.3",
      "resolved": "https://registry.npmjs.org/suspend-react/-/suspend-react-0.1.3.tgz",
      "integrity": "sha512-aqldKgX9aZqpoDp3e8/BZ8Dm7x1pJl+qI3ZKxDN0i/IQTWUwBx/ManmlVJ3wowqbno6c2bmiIfs+Um6LbsjJyQ==",
      "license": "MIT",
      "peerDependencies": {
        "react": ">=17.0"
      }
    },
    "node_modules/three": {
      "version": "0.170.0",
      "resolved": "https://registry.npmjs.org/three/-/three-0.170.0.tgz",
      "integrity": "sha512-FQK+LEpYc0fBD+J8g6oSEyyNzjp+Q7Ks1C568WWaoMRLW+TkNNWmenWeGgJjV105Gd+p/2ql1ZcjYvNiPZBhuQ==",
      "license": "MIT"
    },
    "node_modules/three-mesh-bvh": {
      "version": "0.7.8",
      "resolved": "https://registry.npmjs.org/three-mesh-bvh/-/three-mesh-bvh-0.7.8.tgz",
      "integrity": "sha512-BGEZTOIC14U0XIRw3tO4jY7IjP7n7v24nv9JXS1CyeVRWOCkcOMhRnmENUjuV39gktAw4Ofhr0OvIAiTspQrrw==",
      "deprecated": "Deprecated due to three.js version incompatibility. Please use v0.8.0, instead.",
      "license": "MIT",
      "peerDependencies": {
        "three": ">= 0.151.0"
      }
    },
    "node_modules/three-stdlib": {
      "version": "2.36.1",
      "resolved": "https://registry.npmjs.org/three-stdlib/-/three-stdlib-2.36.1.tgz",
      "integrity": "sha512-XyGQrFmNQ5O/IoKm556ftwKsBg11TIb301MB5dWNicziQBEs2g3gtOYIf7pFiLa0zI2gUwhtCjv9fmjnxKZ1Cg==",
      "license": "MIT",
      "dependencies": {
        "@types/draco3d": "^1.4.0",
        "@types/offscreencanvas": "^2019.6.4",
        "@types/webxr": "^0.5.2",
        "draco3d": "^1.4.1",
        "fflate": "^0.6.9",
        "potpack": "^1.0.1"
      },
      "peerDependencies": {
        "three": ">=0.128.0"
      }
    },
    "node_modules/three-stdlib/node_modules/fflate": {
      "version": "0.6.11",
      "resolved": "https://registry.npmjs.org/fflate/-/fflate-0.6.11.tgz",
      "integrity": "sha512-3JyEFWGjFn7zHmoa9+zG1BmW7X2okcmAB+0Cnu9UFbVs/jCBnl2A8o065ZlXiw145K3eBM3uLuzrYXC0RK7eDg==",
      "license": "MIT"
    },
    "node_modules/tinyglobby": {
      "version": "0.2.17",
      "resolved": "https://registry.npmjs.org/tinyglobby/-/tinyglobby-0.2.17.tgz",
      "integrity": "sha512-wXR/dYpcqKmfWpEdZjiKJOwCNFndD0DMnrW/cYjVGttEkBfVgcLFHoNrlj47mjOVic9yyNu65alsgF4NQyTa2g==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "fdir": "^6.5.0",
        "picomatch": "^4.0.4"
      },
      "engines": {
        "node": ">=12.0.0"
      },
      "funding": {
        "url": "https://github.com/sponsors/SuperchupuDev"
      }
    },
    "node_modules/tone": {
      "version": "15.1.22",
      "resolved": "https://registry.npmjs.org/tone/-/tone-15.1.22.tgz",
      "integrity": "sha512-TCScAGD4sLsama5DjvTUXlLDXSqPealhL64nsdV1hhr6frPWve0DeSo63AKnSJwgfg55fhvxj0iPPRwPN5o0ag==",
      "license": "MIT",
      "dependencies": {
        "standardized-audio-context": "^25.3.70",
        "tslib": "^2.3.1"
      }
    },
    "node_modules/troika-three-text": {
      "version": "0.52.5",
      "resolved": "https://registry.npmjs.org/troika-three-text/-/troika-three-text-0.52.5.tgz",
      "integrity": "sha512-Ry3jRhic9pzcY4JduSvRRyDmVOSqEW19gT4vtK+aCiPNVcDlmkxvGG0YbFd36RTDq1wExOupXnvNF/j1oiHHDA==",
      "license": "MIT",
      "dependencies": {
        "bidi-js": "^1.0.2",
        "troika-three-utils": "^0.52.5",
        "troika-worker-utils": "^0.52.0",
        "webgl-sdf-generator": "1.1.1"
      },
      "peerDependencies": {
        "three": ">=0.125.0"
      }
    },
    "node_modules/troika-three-utils": {
      "version": "0.52.5",
      "resolved": "https://registry.npmjs.org/troika-three-utils/-/troika-three-utils-0.52.5.tgz",
      "integrity": "sha512-WsePbcX8RtfidRfsxK1eCZCjF81ZDzAKHH/evLs0hdV2wpoCb0vArGZHdzdOJrSS3k4zfdtbKDaBh8+phkrYnw==",
      "license": "MIT",
      "peerDependencies": {
        "three": ">=0.125.0"
      }
    },
    "node_modules/troika-worker-utils": {
      "version": "0.52.0",
      "resolved": "https://registry.npmjs.org/troika-worker-utils/-/troika-worker-utils-0.52.0.tgz",
      "integrity": "sha512-W1CpvTHykaPH5brv5VHLfQo9D1OYuo0cSBEUQFFT/nBUzM8iD6Lq2/tgG/f1OelbAS1WtaTPQzE5uM49egnngw==",
      "license": "MIT"
    },
    "node_modules/tslib": {
      "version": "2.8.1",
      "resolved": "https://registry.npmjs.org/tslib/-/tslib-2.8.1.tgz",
      "integrity": "sha512-oJFu94HQb+KVduSUQL7wnpmqnfmLsOA/nAh6b6EH0wCEoK0/mPeXU6c3wKDV83MkOuHPRHtSXKKU99IBazS/2w==",
      "license": "0BSD"
    },
    "node_modules/tunnel-rat": {
      "version": "0.1.2",
      "resolved": "https://registry.npmjs.org/tunnel-rat/-/tunnel-rat-0.1.2.tgz",
      "integrity": "sha512-lR5VHmkPhzdhrM092lI2nACsLO4QubF0/yoOhzX7c+wIpbN1GjHNzCc91QlpxBi+cnx8vVJ+Ur6vL5cEoQPFpQ==",
      "license": "MIT",
      "dependencies": {
        "zustand": "^4.3.2"
      }
    },
    "node_modules/tunnel-rat/node_modules/zustand": {
      "version": "4.5.7",
      "resolved": "https://registry.npmjs.org/zustand/-/zustand-4.5.7.tgz",
      "integrity": "sha512-CHOUy7mu3lbD6o6LJLfllpjkzhHXSBlX8B9+qPddUsIfeF5S/UZ5q0kmCsnRqT1UHFQZchNFDDzMbQsuesHWlw==",
      "license": "MIT",
      "dependencies": {
        "use-sync-external-store": "^1.2.2"
      },
      "engines": {
        "node": ">=12.7.0"
      },
      "peerDependencies": {
        "@types/react": ">=16.8",
        "immer": ">=9.0.6",
        "react": ">=16.8"
      },
      "peerDependenciesMeta": {
        "@types/react": {
          "optional": true
        },
        "immer": {
          "optional": true
        },
        "react": {
          "optional": true
        }
      }
    },
    "node_modules/typescript": {
      "version": "5.9.3",
      "resolved": "https://registry.npmjs.org/typescript/-/typescript-5.9.3.tgz",
      "integrity": "sha512-jl1vZzPDinLr9eUt3J/t7V6FgNEw9QjvBPdysz9KfQDD41fQrC2Y4vKQdiaUpFT4bXlb1RHhLpp8wtm6M5TgSw==",
      "dev": true,
      "license": "Apache-2.0",
      "bin": {
        "tsc": "bin/tsc",
        "tsserver": "bin/tsserver"
      },
      "engines": {
        "node": ">=14.17"
      }
    },
    "node_modules/update-browserslist-db": {
      "version": "1.3.4",
      "resolved": "https://registry.npmjs.org/update-browserslist-db/-/update-browserslist-db-1.3.4.tgz",
      "integrity": "sha512-t8wonIOdQyOjtPd2VktlBu6QjTVTks6v8bSi7kd0r2Vll8TK1JYDZtRRdbmCHOAMphkZgrzK+L+vXK4pyZ8t4A==",
      "dev": true,
      "funding": [
        {
          "type": "opencollective",
          "url": "https://opencollective.com/browserslist"
        },
        {
          "type": "tidelift",
          "url": "https://tidelift.com/funding/github/npm/browserslist"
        },
        {
          "type": "github",
          "url": "https://github.com/sponsors/ai"
        }
      ],
      "license": "MIT",
      "dependencies": {
        "escalade": "^3.2.0",
        "picocolors": "^1.1.1"
      },
      "bin": {
        "update-browserslist-db": "cli.js"
      },
      "peerDependencies": {
        "browserslist": ">= 4.21.0"
      }
    },
    "node_modules/use-isomorphic-layout-effect": {
      "version": "1.2.1",
      "resolved": "https://registry.npmjs.org/use-isomorphic-layout-effect/-/use-isomorphic-layout-effect-1.2.1.tgz",
      "integrity": "sha512-tpZZ+EX0gaghDAiFR37hj5MgY6ZN55kLiPkJsKxBMZ6GZdOSPJXiOzPM984oPYZ5AnehYx5WQp1+ME8I/P/pRA==",
      "dev": true,
      "license": "MIT",
      "peerDependencies": {
        "react": "^16.8.0 || ^17.0.0 || ^18.0.0 || ^19.0.0"
      },
      "peerDependenciesMeta": {
        "@types/react": {
          "optional": true
        }
      }
    },
    "node_modules/use-sync-external-store": {
      "version": "1.7.0",
      "resolved": "https://registry.npmjs.org/use-sync-external-store/-/use-sync-external-store-1.7.0.tgz",
      "integrity": "sha512-6L+EeigHMQhdaIPNIFUKwfWJSwWFQ8gJbJ2DLOs5sDIegTwR9fRxvnM3uciHKjIZhFz+KAv2emhWMRvDmMcY8A==",
      "license": "MIT",
      "peerDependencies": {
        "react": "^16.8.0 || ^17.0.0 || ^18.0.0 || ^19.0.0"
      }
    },
    "node_modules/utility-types": {
      "version": "3.11.0",
      "resolved": "https://registry.npmjs.org/utility-types/-/utility-types-3.11.0.tgz",
      "integrity": "sha512-6Z7Ma2aVEWisaL6TvBCy7P8rm2LQoPv6dJ7ecIaIixHcwfbJ0x7mWdbcwlIM5IGQxPZSFYeqRCqlOOeKoJYMkw==",
      "license": "MIT",
      "engines": {
        "node": ">= 4"
      }
    },
    "node_modules/v8n": {
      "version": "1.5.1",
      "resolved": "https://registry.npmjs.org/v8n/-/v8n-1.5.1.tgz",
      "integrity": "sha512-LdabyT4OffkyXFCe9UT+uMkxNBs5rcTVuZClvxQr08D5TUgo1OFKkoT65qYRCsiKBl/usHjpXvP4hHMzzDRj3A==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/vite": {
      "version": "6.4.4",
      "resolved": "https://registry.npmjs.org/vite/-/vite-6.4.4.tgz",
      "integrity": "sha512-xGjU/SyjeNyb0E4KxXBvYz/1C+3JXuujvf2hXNOtnlcE+58o5ajd9N2/n2VhkiJvpCP2qQasnUpx5PXNeI+p1Q==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "esbuild": "^0.25.0",
        "fdir": "^6.4.4",
        "picomatch": "^4.0.2",
        "postcss": "^8.5.3",
        "rollup": "^4.34.9",
        "tinyglobby": "^0.2.13"
      },
      "bin": {
        "vite": "bin/vite.js"
      },
      "engines": {
        "node": "^18.0.0 || ^20.0.0 || >=22.0.0"
      },
      "funding": {
        "url": "https://github.com/vitejs/vite?sponsor=1"
      },
      "optionalDependencies": {
        "fsevents": "~2.3.3"
      },
      "peerDependencies": {
        "@types/node": "^18.0.0 || ^20.0.0 || >=22.0.0",
        "jiti": ">=1.21.0",
        "less": "*",
        "lightningcss": "^1.21.0",
        "sass": "*",
        "sass-embedded": "*",
        "stylus": "*",
        "sugarss": "*",
        "terser": "^5.16.0",
        "tsx": "^4.8.1",
        "yaml": "^2.4.2"
      },
      "peerDependenciesMeta": {
        "@types/node": {
          "optional": true
        },
        "jiti": {
          "optional": true
        },
        "less": {
          "optional": true
        },
        "lightningcss": {
          "optional": true
        },
        "sass": {
          "optional": true
        },
        "sass-embedded": {
          "optional": true
        },
        "stylus": {
          "optional": true
        },
        "sugarss": {
          "optional": true
        },
        "terser": {
          "optional": true
        },
        "tsx": {
          "optional": true
        },
        "yaml": {
          "optional": true
        }
      }
    },
    "node_modules/webgl-constants": {
      "version": "1.1.1",
      "resolved": "https://registry.npmjs.org/webgl-constants/-/webgl-constants-1.1.1.tgz",
      "integrity": "sha512-LkBXKjU5r9vAW7Gcu3T5u+5cvSvh5WwINdr0C+9jpzVB41cjQAP5ePArDtk/WHYdVj0GefCgM73BA7FlIiNtdg=="
    },
    "node_modules/webgl-sdf-generator": {
      "version": "1.1.1",
      "resolved": "https://registry.npmjs.org/webgl-sdf-generator/-/webgl-sdf-generator-1.1.1.tgz",
      "integrity": "sha512-9Z0JcMTFxeE+b2x1LJTdnaT8rT8aEp7MVxkNwoycNmJWwPdzoXzMh0BjJSh/AEFP+KPYZUli814h8bJZFIZ2jA==",
      "license": "MIT"
    },
    "node_modules/which": {
      "version": "2.0.2",
      "resolved": "https://registry.npmjs.org/which/-/which-2.0.2.tgz",
      "integrity": "sha512-BLI3Tl1TW3Pvl70l3yq3Y64i+awpwXqsGBYWkkqMtnbXgrMD+yj7rhW0kuEDxzJaYXGjEW5ogapKNMEKNMjibA==",
      "license": "ISC",
      "dependencies": {
        "isexe": "^2.0.0"
      },
      "bin": {
        "node-which": "bin/node-which"
      },
      "engines": {
        "node": ">= 8"
      }
    },
    "node_modules/yallist": {
      "version": "3.1.1",
      "resolved": "https://registry.npmjs.org/yallist/-/yallist-3.1.1.tgz",
      "integrity": "sha512-a4UGQaWPH59mOXUYnAG2ewncQS4i4F43Tv3JoAM+s2VDAmS9NsK8GpDMLrCHPksFT7h3K6TOoUNn2pb7RoXx4g==",
      "dev": true,
      "license": "ISC"
    },
    "node_modules/zustand": {
      "version": "5.0.8",
      "resolved": "https://registry.npmjs.org/zustand/-/zustand-5.0.8.tgz",
      "integrity": "sha512-gyPKpIaxY9XcO2vSMrLbiER7QMAMGOQZVRdJ6Zi782jkbzZygq5GI9nG8g+sMgitRtndwaBSl7uiqC49o1SSiw==",
      "license": "MIT",
      "engines": {
        "node": ">=12.20.0"
      },
      "peerDependencies": {
        "@types/react": ">=18.0.0",
        "immer": ">=9.0.6",
        "react": ">=18.0.0",
        "use-sync-external-store": ">=1.2.0"
      },
      "peerDependenciesMeta": {
        "@types/react": {
          "optional": true
        },
        "immer": {
          "optional": true
        },
        "react": {
          "optional": true
        },
        "use-sync-external-store": {
          "optional": true
        }
      }
    }
  }
}
~~~~

## public/fonts/instrument-serif-LICENSE.txt

~~~~txt
Copyright 2022 The Instrument Serif Project Authors (https://github.com/Instrument/instrument-serif) InstrumentSerif-Italic.ttf: Copyright 2022 The Instrument Serif Project Authors (https://github.com/Instrument/instrument-serif)

This Font Software is licensed under the SIL Open Font License, Version 1.1.
This license is copied below, and is also available with a FAQ at:
http://scripts.sil.org/OFL


-----------------------------------------------------------
SIL OPEN FONT LICENSE Version 1.1 - 26 February 2007
-----------------------------------------------------------

PREAMBLE
The goals of the Open Font License (OFL) are to stimulate worldwide
development of collaborative font projects, to support the font creation
efforts of academic and linguistic communities, and to provide a free and
open framework in which fonts may be shared and improved in partnership
with others.

The OFL allows the licensed fonts to be used, studied, modified and
redistributed freely as long as they are not sold by themselves. The
fonts, including any derivative works, can be bundled, embedded,
redistributed and/or sold with any software provided that any reserved
names are not used by derivative works. The fonts and derivatives,
however, cannot be released under any other type of license. The
requirement for fonts to remain under this license does not apply
to any document created using the fonts or their derivatives.

DEFINITIONS
"Font Software" refers to the set of files released by the Copyright
Holder(s) under this license and clearly marked as such. This may
include source files, build scripts and documentation.

"Reserved Font Name" refers to any names specified as such after the
copyright statement(s).

"Original Version" refers to the collection of Font Software components as
distributed by the Copyright Holder(s).

"Modified Version" refers to any derivative made by adding to, deleting,
or substituting -- in part or in whole -- any of the components of the
Original Version, by changing formats or by porting the Font Software to a
new environment.

"Author" refers to any designer, engineer, programmer, technical
writer or other person who contributed to the Font Software.

PERMISSION & CONDITIONS
Permission is hereby granted, free of charge, to any person obtaining
a copy of the Font Software, to use, study, copy, merge, embed, modify,
redistribute, and sell modified and unmodified copies of the Font
Software, subject to the following conditions:

1) Neither the Font Software nor any of its individual components,
in Original or Modified Versions, may be sold by itself.

2) Original or Modified Versions of the Font Software may be bundled,
redistributed and/or sold with any software, provided that each copy
contains the above copyright notice and this license. These can be
included either as stand-alone text files, human-readable headers or
in the appropriate machine-readable metadata fields within text or
binary files as long as those fields can be easily viewed by the user.

3) No Modified Version of the Font Software may use the Reserved Font
Name(s) unless explicit written permission is granted by the corresponding
Copyright Holder. This restriction only applies to the primary font name as
presented to the users.

4) The name(s) of the Copyright Holder(s) or the Author(s) of the Font
Software shall not be used to promote, endorse or advertise any
Modified Version, except to acknowledge the contribution(s) of the
Copyright Holder(s) and the Author(s) or with their explicit written
permission.

5) The Font Software, modified or unmodified, in part or in whole,
must be distributed entirely under this license, and must not be
distributed under any other license. The requirement for fonts to
remain under this license does not apply to any document created
using the Font Software.

TERMINATION
This license becomes null and void if any of the above conditions are
not met.

DISCLAIMER
THE FONT SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO ANY WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT
OF COPYRIGHT, PATENT, TRADEMARK, OR OTHER RIGHT. IN NO EVENT SHALL THE
COPYRIGHT HOLDER BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
INCLUDING ANY GENERAL, SPECIAL, INDIRECT, INCIDENTAL, OR CONSEQUENTIAL
DAMAGES, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF THE USE OR INABILITY TO USE THE FONT SOFTWARE OR FROM
OTHER DEALINGS IN THE FONT SOFTWARE.
~~~~

## src/main.tsx

~~~~tsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import logoUrl from "./assets/blue-heaven-flower.svg";
import "@fontsource/instrument-serif/400.css";
import "./styles.css";

const icon =
  document.querySelector<HTMLLinkElement>('link[rel="icon"]') ??
  document.createElement("link");
icon.rel = "icon";
icon.type = "image/svg+xml";
icon.href = logoUrl;
if (!icon.isConnected) document.head.append(icon);
ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
~~~~

## src/assets/blue-heaven-flower.svg

~~~~svg
<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024" role="img" aria-labelledby="title desc">
  <title id="title">The Danny Flower</title>
  <desc id="desc">Five-petal flower emblem with sage and emerald petals, golden stamens and a luminous cream center, colored for The Danny's memorial forest.</desc>
  <defs>
    <radialGradient id="petal" cx="50%" cy="96%" r="98%" fx="50%" fy="96%">
      <stop offset="0" stop-color="#fff2d3"/>
      <stop offset="0.24" stop-color="#e6ecd8"/>
      <stop offset="0.47" stop-color="#b8cf76"/>
      <stop offset="0.72" stop-color="#87a878"/>
      <stop offset="1" stop-color="#39765a"/>
    </radialGradient>
    <linearGradient id="stamen" x1="0" y1="1" x2="0" y2="0">
      <stop offset="0" stop-color="#fff2d3"/>
      <stop offset="1" stop-color="#e9be74"/>
    </linearGradient>
    <linearGradient id="anther" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#e9be74"/><stop offset="1" stop-color="#b08b4d"/></linearGradient>
    <path id="petalShape" d="M512 513 C471 482 410 408 402 312 C392 199 436 106 512 91 C588 106 632 199 622 312 C614 408 553 482 512 513 Z"/>
    <path id="filament" d="M512 526 Q498 459 475 416" fill="none" stroke="url(#stamen)" stroke-width="9" stroke-linecap="round"/>
    <ellipse id="tip" cx="475" cy="415" rx="12" ry="23" transform="rotate(-24 475 415)" fill="url(#anther)"/>
  </defs>
  <!-- Each petal remains a clean, editable vector path. -->
  <g stroke="#fff2d3" stroke-opacity=".6" stroke-width="4" stroke-linejoin="round">
    <use href="#petalShape" fill="url(#petal)"/>
    <use href="#petalShape" transform="rotate(72 512 512)" fill="url(#petal)"/>
    <use href="#petalShape" transform="rotate(144 512 512)" fill="url(#petal)"/>
    <use href="#petalShape" transform="rotate(216 512 512)" fill="url(#petal)"/>
    <use href="#petalShape" transform="rotate(288 512 512)" fill="url(#petal)"/>
  </g>
  <!-- Filaments and anthers -->
  <g>
    <use href="#filament"/><use href="#filament" transform="rotate(58 512 512)"/>
    <use href="#filament" transform="rotate(116 512 512)"/>
    <use href="#filament" transform="rotate(174 512 512)"/>
    <use href="#filament" transform="rotate(232 512 512)"/>
    <use href="#filament" transform="rotate(290 512 512)"/>
    <use href="#tip"/><use href="#tip" transform="rotate(58 512 512)"/>
    <use href="#tip" transform="rotate(116 512 512)"/>
    <use href="#tip" transform="rotate(174 512 512)"/>
    <use href="#tip" transform="rotate(232 512 512)"/>
    <use href="#tip" transform="rotate(290 512 512)"/>
  </g>
  <g fill="#fff2d3"><circle cx="512" cy="512" r="16"/><circle cx="493" cy="513" r="10"/><circle cx="532" cy="513" r="10"/><circle cx="505" cy="494" r="10"/><circle cx="524" cy="494" r="10"/></g>
</svg>
~~~~

## src/ui/BrandLogo.tsx

~~~~tsx
import logoUrl from "../assets/blue-heaven-flower.svg";

/** The project emblem is decorative beside the existing names and labels. */
export function BrandLogo({ className = "" }: { className?: string }) {
  return (
    <img
      className={`brand-logo ${className}`}
      src={logoUrl}
      width={28}
      height={28}
      alt=""
      aria-hidden="true"
      draggable={false}
    />
  );
}
~~~~

## src/ui/TitleScreen.tsx

~~~~tsx
import { useState } from "react";
import { PROJECT_NAME, TEXT } from "../config";
import { useStore } from "../store";
import { Icon } from "./Icons";
import { TitleBackdrop } from "./TitleBackdrop";
import { BrandLogo } from "./BrandLogo";
export function TitleScreen() {
  const [starting, setStarting] = useState(false);
  const muted = useStore((s) => s.settings.muted);
  const begin = async () => {
    if (starting) return;
    setStarting(true);
    // Create and resume in the original gesture, before the lazy audio module loads.
    try {
      const context = new AudioContext();
      const resumed = context.resume();
      const audio = await import("../audio/engine");
      await resumed;
      await audio.unlockAudio(context);
    } catch {
      useStore.setState({ audioFailed: true });
    }
    useStore.getState().setPhase("dedication");
  };
  return (
    <main className="title-screen">
      <TitleBackdrop />
      <a
        className="brand"
        href="#"
        onClick={(e) => e.preventDefault()}
        aria-label={PROJECT_NAME}
      >
        <BrandLogo />
        <span>{PROJECT_NAME}</span>
      </a>
      <button
        className="icon-button title-mute"
        aria-label={muted ? TEXT.unmute : TEXT.mute}
        onClick={() => useStore.getState().setSettings({ muted: !muted })}
      >
        <Icon name={muted ? "mute" : "sound"} />
      </button>
      <div className="title-content">
        <div className="eyebrow">{TEXT.eyebrow}</div>
        <h1>
          {PROJECT_NAME}
          <span className="title-dot">.</span>
        </h1>
        <p className="title-sub">{TEXT.titleSub}</p>
        <div className="title-rule">
          <span />
          <BrandLogo />
          <span />
        </div>
        <p className="title-description">{TEXT.titleDescription}</p>
        <button
          className="begin-button"
          onClick={() => void begin()}
          disabled={starting}
        >
          {starting ? TEXT.opening : TEXT.begin}
          <Icon name="arrow" />
        </button>
        <p className="sound-note">
          <Icon name="sound" />
          {TEXT.headphones}
        </p>
      </div>
      <footer className="title-footer">
        <span>{TEXT.crafted}</span>
        <span>
          {TEXT.footerMotto[0]} <span className="tiny-star">✧</span>{" "}
          {TEXT.footerMotto[1]}
        </span>
      </footer>
    </main>
  );
}
~~~~

## src/ui/Hud.tsx

~~~~tsx
import { PROJECT_NAME, TEXT } from "../config";
import { useStore } from "../store";
import { MemorySlots } from "./MemorySlots";
import { Compass } from "./Compass";
import { Icon } from "./Icons";
import { playSound } from "../audio/bridge";
import { BrandLogo } from "./BrandLogo";
export function Hud() {
  const muted = useStore((s) => s.settings.muted),
    near = useStore((s) => s.nearTree),
    hung = useStore((s) => s.hung),
    collected = useStore((s) => s.collected),
    phase = useStore((s) => s.phase),
    nearMemory = useStore((s) => s.nearMemory);
  const available = collected.some((id) => !hung.includes(id));
  const audioFailed = useStore((s) => s.audioFailed);
  return (
    <div className="hud">
      <div className="hud-left">
        <button
          className="icon-button"
          aria-label={TEXT.pauseLabel}
          onClick={() => {
            playSound("click");
            useStore.setState({ paused: true });
          }}
        >
          <Icon name="pause" />
        </button>
        <button
          className="icon-button"
          aria-label={muted ? TEXT.unmute : TEXT.mute}
          onClick={() => useStore.getState().setSettings({ muted: !muted })}
        >
          <Icon name={muted ? "mute" : "sound"} />
        </button>
      </div>
      <div className="hud-center">
        <div className="wordmark">
          <BrandLogo />
          {PROJECT_NAME}
        </div>
        <MemorySlots />
      </div>
      <div className="hud-right">
        <Compass />
        <button
          className="icon-button"
          aria-label={TEXT.showDedication}
          onClick={() => useStore.setState({ dedicationOpen: true })}
        >
          <Icon name="heart" />
        </button>
      </div>
      <div className="forest-label">
        <span className="eyebrow">{TEXT.treeLabel}</span>
        <span>{hung.length === 8 ? TEXT.fullTree : TEXT.treeSub}</span>
        <div className="tree-progress">
          <i style={{ width: `${(hung.length / 8) * 100}%` }} />
        </div>
        <small>
          {hung.length} / 8 {TEXT.returned}
        </small>
      </div>
      {phase === "explore" && near && available && (
        <button
          className="primary hang-button"
          onClick={() => useStore.getState().beginHanging()}
        >
          {TEXT.hang}
          <Icon name="leaf" />
        </button>
      )}
      {phase === "explore" && nearMemory && (
        <button
          className="near-memory"
          onClick={() => useStore.getState().openMemory(nearMemory)}
        >
          <Icon name="spark" />
          {TEXT.view}
          <kbd>E</kbd>
        </button>
      )}
      <span className="controls-note">
        {TEXT.controlHold}
        <span> · </span>
        {TEXT.controlKeys}
      </span>
      {audioFailed && (
        <span className="audio-notice" role="status">
          {TEXT.audioUnavailable}
        </span>
      )}
    </div>
  );
}
~~~~

## src/ui/LoadingScreen.tsx

~~~~tsx
import { TEXT } from "../config";
import { BrandLogo } from "./BrandLogo";
export function LoadingScreen({ progress = 0 }: { progress?: number }) {
  return (
    <div className="loading-screen" role="status" aria-label={TEXT.growLabel}>
      <div className="loading-emblem">
        <BrandLogo />
      </div>
      <span>{TEXT.growing}</span>
      <div className="loading-track">
        <i style={{ width: `${Math.max(8, progress)}%` }} />
      </div>
    </div>
  );
}
~~~~

## src/ui/Toasts.tsx

~~~~tsx
import { useEffect, useState } from "react";
import { TEXT } from "../config";
import { useStore } from "../store";
import { BrandLogo } from "./BrandLogo";
export function Toasts() {
  const toast = useStore((s) => s.toast),
    phase = useStore((s) => s.phase),
    ready = useStore((s) => s.sceneReady),
    paused = useStore((s) => s.paused);
  const [hint, setHint] = useState(0);
  useEffect(() => {
    if (phase !== "explore" || !ready || paused) return;
    const timer = window.setTimeout(
      () => setHint((h) => Math.min(3, h + 1)),
      6500,
    );
    return () => clearTimeout(timer);
  }, [phase, ready, hint, paused]);
  useEffect(() => {
    if (!toast || paused) return;
    const timer = setTimeout(() => useStore.setState({ toast: null }), 4000);
    return () => clearTimeout(timer);
  }, [toast, paused]);
  const hints = [
    matchMedia("(pointer: coarse)").matches ? TEXT.touchWalk : TEXT.walk,
    ...TEXT.hints,
  ];
  const text = toast || hints[hint];
  return phase === "explore" && ready && text ? (
    <div className="toast" key={text} role="status">
      <BrandLogo />
      <span>{text}</span>
    </div>
  ) : null;
}
~~~~

## src/ui/Viewer.tsx

~~~~tsx
import { useMemo } from "react";
import { MEMORIES, TEXT } from "../config";
import { useStore } from "../store";
import { memoryUrl } from "../textures/memoryArt";
import { useDialog } from "../hooks/useDialog";
import { Icon } from "./Icons";
import { BrandLogo } from "./BrandLogo";
import { playSound } from "../audio/bridge";
export function Viewer() {
  const muted = useStore((s) => s.settings.muted);
  const id = useStore((s) => s.activeMemory),
    collected = useStore((s) => s.collected);
  const index = MEMORIES.findIndex((m) => m.id === id),
    memory = MEMORIES[index];
  const fallback = useMemo(() => memoryUrl(Math.max(0, index)), [index]);
  const close = () => useStore.getState().closeMemory();
  const ref = useDialog(close);
  const keep = () => {
    const picture = ref.current?.querySelector<HTMLImageElement>(
      ".polaroid-large img",
    );
    if (picture && !useStore.getState().settings.reducedMotion) {
      const rect = picture.getBoundingClientRect(),
        clone = picture.cloneNode() as HTMLImageElement;
      Object.assign(clone.style, {
        position: "fixed",
        left: `${rect.left}px`,
        top: `${rect.top}px`,
        width: `${rect.width}px`,
        height: `${rect.height}px`,
        zIndex: "100",
        pointerEvents: "none",
        objectFit: "cover",
        boxShadow: "0 0 28px #f2d89a",
      });
      document.body.append(clone);
      const anim = clone.animate(
        [
          { transform: "rotate(-5deg) scale(1)", opacity: 1 },
          {
            transform: `translate(${innerWidth / 2 - rect.left - rect.width / 2}px,${75 - rect.top - rect.height / 2}px) rotate(0deg) scale(.055)`,
            opacity: 0.1,
          },
        ],
        { duration: 650, easing: "cubic-bezier(.3,.7,.3,1)", fill: "forwards" },
      );
      void anim.finished.then(() => clone.remove()).catch(() => clone.remove());
    }
    playSound("keep");
    useStore.getState().keepMemory();
    useStore.setState({ toast: TEXT.kept });
  };
  if (!memory) return null;
  return (
    <div
      className="overlay viewer"
      ref={ref}
      role="dialog"
      aria-modal="true"
      aria-labelledby="memory-title"
      tabIndex={-1}
    >
      <button
        className="icon-button viewer-sound"
        aria-label={muted ? TEXT.unmute : TEXT.mute}
        onClick={() => useStore.getState().setSettings({ muted: !muted })}
      >
        <Icon name={muted ? "mute" : "sound"} />
      </button>
      <button
        className="icon-button viewer-close"
        onClick={close}
        aria-label={TEXT.closeMemory}
      >
        <Icon name="close" />
      </button>
      <div className="viewer-layout">
        <div className="polaroid-large">
          <img
            src={memory.imageUrl || fallback}
            className={memory.imageUrl ? "real-photo" : ""}
            onError={(e) => {
              e.currentTarget.src = fallback;
              e.currentTarget.className = "";
            }}
            alt={memory.caption}
          />
          <span>{memory.caption}</span>
        </div>
        <article className="memory-story">
          <div className="eyebrow">
            {TEXT.memoryFrom} {memory.zone.toUpperCase()}
          </div>
          <h2 id="memory-title">{memory.title}</h2>
          <p className="memory-caption">{memory.caption}</p>
          {memory.story.split("\n").map((line, i) => (
            <p
              className="story-line"
              key={i}
              style={{ animationDelay: `${i * 120 + 150}ms` }}
            >
              {line}
            </p>
          ))}
          <div className="viewer-actions">
            {!collected.includes(id!) && (
              <button className="primary" onClick={keep}>
                {TEXT.keep}
                <Icon name="heart" />
              </button>
            )}
            <button className="text-button" onClick={close}>
              {TEXT.close}
            </button>
          </div>
          <span className="save-note">
            <BrandLogo />
            {TEXT.saving}
          </span>
        </article>
      </div>
    </div>
  );
}
~~~~

## src/textures/memoryArt.ts

~~~~ts
import { random } from "../utils/random";
const cache = new Map<number, HTMLCanvasElement>();
const urls = new Map<number, string>();
export function memoryArt(index: number): HTMLCanvasElement {
  const existing = cache.get(index);
  if (existing) return existing;
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 600;
  const c = canvas.getContext("2d")!;
  const r = random(800 + index);
  c.fillStyle = "#fff6df";
  c.fillRect(0, 0, 512, 600);
  c.save();
  c.beginPath();
  c.rect(30, 30, 452, 452);
  c.clip();
  c.translate(30, 30);
  const sky = c.createLinearGradient(0, 0, 0, 452);
  sky.addColorStop(
    0,
    [
      "#8baaad",
      "#dfa789",
      "#b48e67",
      "#87aeb0",
      "#bdc5a1",
      "#8e9d8b",
      "#d8b494",
      "#304d5a",
    ][index],
  );
  sky.addColorStop(1, "#f1d9ad");
  c.fillStyle = sky;
  c.fillRect(0, 0, 452, 452);
  const ellipse = (
    x: number,
    y: number,
    rx: number,
    ry: number,
    color: string,
    rot = 0,
  ) => {
    c.fillStyle = color;
    c.beginPath();
    c.ellipse(x, y, rx, ry, rot, 0, Math.PI * 2);
    c.fill();
  };
  const line = (
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    color: string,
    width = 3,
  ) => {
    c.strokeStyle = color;
    c.lineWidth = width;
    c.beginPath();
    c.moveTo(x1, y1);
    c.lineTo(x2, y2);
    c.stroke();
  };
  const hill = (height: number, color: string) => {
    c.fillStyle = color;
    c.beginPath();
    c.moveTo(-40, 500);
    c.lineTo(-40, height);
    for (let x = -40; x < 510; x += 20)
      c.lineTo(x, height + Math.sin(x / 95 + index) * 32);
    c.lineTo(510, 500);
    c.fill();
  };
  if ([0, 1, 3, 4, 6, 7].includes(index)) {
    ellipse(335, 108, 41, 41, "#f6dda1");
    hill(210, "#789b85");
    hill(260, "#527c68");
  }
  if (index === 0 || index === 3) {
    c.fillStyle = "#87b5b3";
    c.fillRect(0, 280, 452, 172);
    for (let i = 0; i < 36; i++) {
      const x = r() * 452,
        y = 290 + r() * 160;
      line(x, y, x + 12 + r() * 55, y, "#bdd1bd", 2);
    }
    if (index === 0) {
      c.fillStyle = "#8d684d";
      c.fillRect(0, 342, 180, 18);
      c.fillRect(35, 357, 8, 90);
      c.fillRect(143, 357, 8, 90);
      ellipse(122, 304, 14, 22, "#c58261");
      ellipse(122, 279, 11, 11, "#e8c895");
      line(135, 300, 208, 251, "#5e513c");
      line(208, 251, 228, 335, "#e2d6b7", 1);
    } else {
      c.fillStyle = "#805b46";
      c.beginPath();
      c.moveTo(120, 352);
      c.lineTo(320, 352);
      c.lineTo(290, 380);
      c.lineTo(155, 380);
      c.fill();
      line(217, 165, 217, 355, "#705b49", 5);
      c.fillStyle = "#f7ebcd";
      c.beginPath();
      c.moveTo(207, 184);
      c.lineTo(129, 334);
      c.lineTo(207, 334);
      c.fill();
      c.fillStyle = "#d7c7a6";
      c.beginPath();
      c.moveTo(231, 215);
      c.lineTo(305, 332);
      c.lineTo(231, 332);
      c.fill();
    }
  } else if (index === 1) {
    hill(315, "#375f4d");
    for (let i = 0; i < 9; i++) {
      const x = i * 60 - 10;
      line(x, 430, x, 300, "#425641", 5);
      c.fillStyle = "#3c6653";
      c.beginPath();
      c.moveTo(x - 30, 360);
      c.lineTo(x, 268);
      c.lineTo(x + 30, 360);
      c.fill();
    }
  } else if (index === 2) {
    c.fillStyle = "#e1c9a4";
    c.fillRect(0, 0, 452, 452);
    c.fillStyle = "#9baf9c";
    c.fillRect(45, 28, 160, 174);
    line(125, 28, 125, 202, "#f3e0bd", 9);
    line(45, 110, 205, 110, "#f3e0bd", 9);
    c.fillStyle = "#a46f50";
    c.beginPath();
    c.moveTo(44, 297);
    c.lineTo(364, 269);
    c.lineTo(452, 422);
    c.lineTo(0, 452);
    c.fill();
    for (let i = 0; i < 4; i++) {
      ellipse(72 + i * 95, 344 + (i % 2) * 40, 34, 17, "#eee0bb");
      ellipse(72 + i * 95, 344 + (i % 2) * 40, 23, 11, "#cac8a5");
    }
    c.fillStyle = "#faf0cf";
    c.fillRect(247, 200, 9, 98);
    ellipse(251, 195, 7, 15, "#efb362");
    ellipse(203, 291, 35, 17, "#597a50");
  } else if (index === 4) {
    hill(330, "#698a55");
    for (let i = 0; i < 30; i++) {
      const x = r() * 452,
        y = 300 + r() * 145;
      line(x, y, x, y - 32, "#4b714e", 3);
      for (let j = 0; j < 5; j++)
        ellipse(
          x + Math.cos(j * 1.256) * 8,
          y - 32 + Math.sin(j * 1.256) * 8,
          7,
          5,
          i % 2 ? "#e4b4aa" : "#eed38b",
        );
      ellipse(x, y - 32, 4, 4, "#a88745");
    }
    c.fillStyle = "#ab7b57";
    c.fillRect(25, 350, 402, 12);
    for (let i = 0; i < 8; i++) c.fillRect(40 + i * 51, 327, 8, 112);
  } else if (index === 5) {
    c.fillStyle = "#d2b991";
    c.fillRect(0, 350, 452, 102);
    ellipse(220, 344, 87, 18, "#937b60");
    ellipse(207, 281, 59, 62, "#b77d4c", -0.2);
    ellipse(230, 228, 43, 44, "#c48c55", -0.2);
    c.save();
    c.translate(232, 223);
    c.rotate(0.23);
    c.fillStyle = "#866345";
    c.fillRect(-9, -157, 18, 158);
    c.fillRect(-14, -184, 28, 35);
    c.restore();
    ellipse(221, 253, 20, 21, "#4b4f40");
    line(186, 309, 235, 319, "#604936", 9);
    for (let i = 0; i < 5; i++)
      line(240 + i * 2, 55, 194 + i * 3, 311, "#eee0b8", 1);
  } else if (index === 6) {
    hill(305, "#688866");
    c.fillStyle = "#b9aa87";
    c.beginPath();
    c.moveTo(192, 262);
    c.bezierCurveTo(302, 340, 90, 350, 66, 452);
    c.lineTo(350, 452);
    c.bezierCurveTo(360, 360, 248, 315, 216, 262);
    c.fill();
    c.fillStyle = "#bb7053";
    c.beginPath();
    c.roundRect(170, 336, 118, 53, 12);
    c.fill();
    c.fillStyle = "#c1d4c2";
    c.fillRect(182, 345, 90, 19);
    ellipse(185, 391, 13, 16, "#4a5348");
    ellipse(273, 391, 13, 16, "#4a5348");
  } else {
    hill(300, "#254e45");
    for (let i = 0; i < 38; i++)
      ellipse(r() * 452, r() * 230, 1.5, 1.5, "#f9e6a5");
    ellipse(224, 378, 82, 21, "#6e6551");
    line(162, 388, 280, 357, "#8e6a43", 17);
    line(165, 355, 276, 389, "#ab794b", 15);
    for (let i = 0; i < 7; i++) {
      c.fillStyle = i % 2 ? "#f6d18b" : "#df9c58";
      c.beginPath();
      c.moveTo(178 + i * 10, 368);
      c.quadraticCurveTo(177 + i * 12, 340, 217 + i * 4, 280 - r() * 40);
      c.quadraticCurveTo(273 - i * 7, 341, 268 - i * 7, 368);
      c.fill();
    }
  }
  for (let i = 0; i < 15000; i++) {
    c.fillStyle = r() > 0.5 ? "rgba(255,249,222,.07)" : "rgba(49,64,48,.045)";
    c.fillRect(r() * 452, r() * 452, 1 + r() * 3, 1);
  }
  c.restore();
  c.fillStyle = "#a99a7c";
  c.font = '23px "Instrument Serif", serif';
  c.textAlign = "center";
  c.fillText(String(index + 1).padStart(2, "0") + "  /  08", 256, 554);
  cache.set(index, canvas);
  return canvas;
}
export function memoryUrl(index: number) {
  let url = urls.get(index);
  if (!url) {
    url = memoryArt(index).toDataURL("image/png");
    urls.set(index, url);
  }
  return url;
}
~~~~

## src/config.ts

~~~~ts
export const PROJECT_NAME = "The Danny";
export const FATHER_FULL_NAME = "Danilo Cambronero";
export const FATHER_NICKNAME = "Danny";
export const BIRTH_YEAR = 1964;
export const PASSING_YEAR = 2026;
export const LIFE_YEARS = `${BIRTH_YEAR}\u2009–\u2009${PASSING_YEAR}`;
export const TRIBUTE_NAME = FATHER_FULL_NAME.replace(
  " ",
  ` "${FATHER_NICKNAME}" `,
);
export const DEDICATION_TEXT = `This site is dedicated to Snowi's late father, ${FATHER_FULL_NAME} (${LIFE_YEARS}).`;
export const DEDICATION_MESSAGE = "[ADD A SHORT, WARM MESSAGE HERE]";
export const FINAL_MESSAGE = "[Thank you for remembering him.]";

export type Memory = {
  id: string;
  title: string;
  caption: string;
  story: string;
  position: [number, number];
  zone: string;
  imageUrl?: string;
};
export const MEMORIES: Memory[] = [
  {
    id: "lake",
    title: "[MEMORY TITLE]",
    caption: "A quiet fishing morning",
    story: "[REPLACE WITH A REAL STORY ABOUT HIM]",
    position: [10, 10],
    zone: "The Pond",
  },
  {
    id: "sunrise",
    title: "[MEMORY TITLE]",
    caption: "The light we carry",
    story: "[REPLACE WITH A REAL STORY ABOUT HIM]",
    position: [-15, 12],
    zone: "Old Stone Ridge",
  },
  {
    id: "dinner",
    title: "[MEMORY TITLE]",
    caption: "A place at the table",
    story: "[REPLACE WITH A REAL STORY ABOUT HIM]",
    position: [-24, -7],
    zone: "Whispering Pines",
  },
  {
    id: "boat",
    title: "[MEMORY TITLE]",
    caption: "Where the water takes us",
    story: "[REPLACE WITH A REAL STORY ABOUT HIM]",
    position: [24, -9],
    zone: "The Pond · reed bank",
  },
  {
    id: "garden",
    title: "[MEMORY TITLE]",
    caption: "Things he helped grow",
    story: "[REPLACE WITH A REAL STORY ABOUT HIM]",
    position: [15, -25],
    zone: "Blossom Grove",
  },
  {
    id: "guitar",
    title: "[MEMORY TITLE]",
    caption: "A familiar little melody",
    story: "[REPLACE WITH A REAL STORY ABOUT HIM]",
    position: [-10, -28],
    zone: "Mushroom Hollow",
  },
  {
    id: "road",
    title: "[MEMORY TITLE]",
    caption: "The long way home",
    story: "[REPLACE WITH A REAL STORY ABOUT HIM]",
    position: [30, 22],
    zone: "Wildflower Meadow",
  },
  {
    id: "fire",
    title: "[MEMORY TITLE]",
    caption: "Warmth that stays",
    story: "[REPLACE WITH A REAL STORY ABOUT HIM]",
    position: [-33, 27],
    zone: "The quiet woodland",
  },
];

export const PALETTE = {
  moss: "#264c3c",
  sage: "#87a878",
  emerald: "#39765a",
  lime: "#b8cf76",
  gold: "#e9be74",
  cream: "#fff2d3",
  pink: "#e7b2af",
  red: "#bd5949",
  sky: "#b5cbb9",
  ground: "#719b67",
  blue: "#b9dbe0",
  bark: "#765a41",
};
export const WORLD = {
  seed: 4217,
  size: 200,
  chunk: 25,
  radius: 58,
  tree: [0, 0] as const,
  pond: [19, 5] as const,
  pondRadius: 5.7,
};
export const QUALITY = {
  high: { shadow: 1024, grass: 1, particles: 480, dpr: 1.75 },
  medium: { shadow: 512, grass: 0.6, particles: 260, dpr: 1.4 },
  low: { shadow: 0, grass: 0.3, particles: 120, dpr: 1 },
};
export const TEXT = {
  eyebrow: "A LITTLE FOREST. A LASTING LOVE.",
  titleSub: "Some things live on.",
  titleDescription:
    "A quiet place to wander, gather memories,\nand watch love take root.",
  begin: "Tap to begin",
  headphones: "Best enjoyed with sound & a little time",
  crafted: "A memorial forest, built with love.",
  dedicationLabel: "IN LOVING MEMORY",
  continue: "Continue",
  skipIntro: "Skip intro",
  intro: [
    "The forest remembers...",
    "...but some memories have been scattered.",
  ],
  walk: "Click and hold to explore",
  touchWalk: "Touch and hold to walk",
  hints: [
    `Find ${FATHER_NICKNAME}'s glowing memories around the forest`,
    `Bring ${FATHER_NICKNAME}'s memories back to the tree`,
  ],
  view: "Tap to view",
  keep: "Keep this memory",
  close: "Close",
  hang: "Hang your memories on the tree",
  kept: `A little piece of ${FATHER_NICKNAME}, carried with you.`,
  hung: `A memory of ${FATHER_NICKNAME} returned. A little more life.`,
  treeLabel: "THE MEMORY TREE",
  treeSub: "Every memory helps it grow.",
  finaleLabel: "LOVE TAKES ROOT",
  explore: "Keep exploring",
  pause: "A quiet moment",
  pauseSub: "The forest will be here when you’re ready.",
  resume: "Return to the forest",
  reset: "Reset progress",
  resetConfirm: "Erase saved memories? This cannot be undone.",
  emptySlot: "A memory still waiting to be found",
  saving: "Progress is saved on this device",
  unavailable: "This forest needs WebGL to grow.",
  fallback:
    "Try opening it in a browser with graphics acceleration enabled. Your memories are safely kept on this device.",
  contextLost: "The forest is taking a breath.",
  contextHint: "Your progress is safe. Reload to return to the clearing.",
  opening: "Opening the forest…",
  footerMotto: ["WANDER SLOWLY", "REMEMBER WARMLY"],
  fullTree: "A forest full of love.",
  returned: "memories returned",
  found: "MEMORIES FOUND",
  controlHold: "HOLD TO WANDER",
  controlKeys: "WASD TO WALK",
  memoryFrom: "A MEMORY FROM",
  pauseLabel: "Pause",
  showDedication: "Show dedication",
  closeMemory: "Close memory",
  mute: "Mute sound",
  unmute: "Unmute sound",
  sound: "Sound",
  muteShort: "Mute",
  unmuteShort: "Unmute",
  volume: "Master volume",
  detail: "Forest detail",
  quality: "Quality",
  tiers: { auto: "Auto", high: "High", medium: "Medium", low: "Low" },
  reduced: "Reduced motion",
  large: "Large text",
  cancel: "Cancel",
  growing: "Growing a little forest…",
  growLabel: "Growing your forest",
  retry: "Try again",
  canvasLabel:
    "Memorial forest. Use WASD or arrow keys to walk. E or Space to view nearby memories.",
  compassLabel: "Direction to the nearest undiscovered memory",
  compassNorth: "N",
  audioUnavailable:
    "Sound is unavailable in this browser. The forest is still yours to explore.",
  read: "Read",
  hungLabel: ", hanging on the tree",
};
~~~~

## src/persistence.ts

~~~~ts
import type { StateStorage } from "zustand/middleware";
import { MEMORIES } from "./config";
import type { Settings } from "./store";

export const SAVE_KEY = "the-danny-v2";
export const LEGACY_SAVE_KEY = "the-danny-v1";
export const SAVE_VERSION = 2;

export type SavedProgress = {
  collected: string[];
  hung: string[];
  introSeen: boolean;
  settings: Partial<Settings>;
};
const validIds = new Set(MEMORIES.map((memory) => memory.id));
const record = (value: unknown): Record<string, unknown> =>
  value !== null && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};

/** Restore known data only; runtime state and actions never come from storage. */
export function normalizeProgress(value: unknown): SavedProgress {
  const saved = record(value);
  const ids = (list: unknown): string[] =>
    Array.isArray(list)
      ? [
          ...new Set(
            list.filter(
              (id): id is string => typeof id === "string" && validIds.has(id),
            ),
          ),
        ]
      : [];
  const hung = ids(saved.hung);
  const settings: Partial<Settings> = {};
  const preferences = record(saved.settings);
  for (const key of [
    "muted",
    "reducedMotion",
    "largeText",
    "skipIntro",
  ] as const)
    if (typeof preferences[key] === "boolean") settings[key] = preferences[key];
  if (
    typeof preferences.volume === "number" &&
    Number.isFinite(preferences.volume)
  )
    settings.volume = Math.max(0, Math.min(1, preferences.volume));
  const quality = preferences.quality;
  if (
    quality === "auto" ||
    quality === "high" ||
    quality === "medium" ||
    quality === "low"
  )
    settings.quality = quality;
  return {
    collected: [...new Set([...ids(saved.collected), ...hung])],
    hung,
    introSeen: saved.introSeen === true,
    settings,
  };
}

type BrowserStorage = Pick<Storage, "getItem" | "setItem" | "removeItem">;

/** Zustand's migrate handles versions within one key, so bridge the old key here. */
export function createCompatibleStorage(
  resolveStorage: () => BrowserStorage = () => localStorage,
): StateStorage {
  const fallback = new Map<string, string>();
  const read = (name: string): string | null => {
    if (fallback.has(name)) return fallback.get(name)!;
    try {
      return resolveStorage().getItem(name);
    } catch {
      return null;
    }
  };
  const storage: StateStorage = {
    getItem: (name) => {
      const current = read(name);
      // An existing v2 save wins even when empty or corrupt: never revive a reset.
      if (name !== SAVE_KEY || current !== null) return current;
      const legacy = read(LEGACY_SAVE_KEY);
      if (legacy === null) return null;
      try {
        const envelope = record(JSON.parse(legacy));
        if (
          envelope.version !== 1 ||
          !envelope.state ||
          typeof envelope.state !== "object" ||
          Array.isArray(envelope.state)
        )
          return null;
        const upgraded = JSON.stringify({
          state: normalizeProgress(envelope.state),
          version: SAVE_VERSION,
        });
        storage.setItem(SAVE_KEY, upgraded);
        // Leave the v1 backup untouched, including when storage writes are blocked.
        return upgraded;
      } catch {
        return null;
      }
    },
    setItem: (name, value) => {
      if (fallback.get(name) === value) return;
      fallback.set(name, value);
      try {
        resolveStorage().setItem(name, value);
      } catch {
        // A quota or privacy restriction still permits saves for this session.
      }
    },
    removeItem: (name) => {
      fallback.delete(name);
      try {
        resolveStorage().removeItem(name);
      } catch {
        // Storage may be unavailable.
      }
    },
  };
  return storage;
}
~~~~

## src/store.ts

~~~~ts
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { MEMORIES } from "./config";
import { playSound } from "./audio/bridge";
import {
  createCompatibleStorage,
  normalizeProgress,
  LEGACY_SAVE_KEY,
  SAVE_KEY,
  SAVE_VERSION,
} from "./persistence";

export type Phase =
  | "loading"
  | "title"
  | "dedication"
  | "intro"
  | "explore"
  | "viewer"
  | "hanging"
  | "finale";
export type Tier = "high" | "medium" | "low";
export type Settings = {
  muted: boolean;
  volume: number;
  quality: "auto" | Tier;
  reducedMotion: boolean;
  largeText: boolean;
  skipIntro: boolean;
};
type State = {
  phase: Phase;
  collected: string[];
  hung: string[];
  hanging: string[];
  introSeen: boolean;
  settings: Settings;
  tier: Tier;
  paused: boolean;
  dedicationOpen: boolean;
  sceneReady: boolean;
  activeMemory: string | null;
  nearMemory: string | null;
  nearTree: boolean;
  toast: string | null;
  audioFailed: boolean;
  setPhase: (phase: Phase) => void;
  setSettings: (v: Partial<Settings>) => void;
  openMemory: (id: string) => void;
  closeMemory: () => void;
  keepMemory: () => void;
  beginHanging: () => void;
  hangOne: (id: string) => void;
  finishHanging: () => void;
  reset: () => void;
};
const safeStorage = createCompatibleStorage();
const mobile =
  typeof matchMedia !== "undefined" && matchMedia("(pointer: coarse)").matches;
const reduced =
  typeof matchMedia !== "undefined" &&
  matchMedia("(prefers-reduced-motion: reduce)").matches;
const validIds = new Set(MEMORIES.map((m) => m.id));
export const useStore = create<State>()(
  persist(
    (set, get) => ({
      phase: "loading",
      collected: [],
      hung: [],
      hanging: [],
      introSeen: false,
      settings: {
        muted: false,
        volume: 0.65,
        quality: "auto",
        reducedMotion: reduced,
        largeText: false,
        skipIntro: false,
      },
      tier: mobile ? "medium" : "high",
      paused: false,
      dedicationOpen: false,
      sceneReady: false,
      activeMemory: null,
      nearMemory: null,
      nearTree: true,
      toast: null,
      audioFailed: false,
      setPhase: (phase) => set({ phase }),
      setSettings: (v) =>
        set((s) => ({
          settings: { ...s.settings, ...v },
          ...(v.quality && v.quality !== "auto" ? { tier: v.quality } : {}),
        })),
      openMemory: (id) => {
        const s = get();
        if (
          validIds.has(id) &&
          (s.phase === "explore" || s.phase === "finale") &&
          !s.paused
        ) {
          playSound("paper");
          set({ activeMemory: id, phase: "viewer" });
        }
      },
      closeMemory: () => set({ activeMemory: null, phase: "explore" }),
      keepMemory: () => {
        const s = get();
        if (!s.activeMemory) return;
        set({
          collected: [...new Set([...s.collected, s.activeMemory])],
          activeMemory: null,
          phase: "explore",
        });
      },
      beginHanging: () => {
        const s = get();
        const ids = s.collected.filter((id) => !s.hung.includes(id));
        if (ids.length && s.phase === "explore" && s.nearTree)
          set({ hanging: ids, phase: "hanging" });
      },
      hangOne: (id) => set((s) => ({ hung: [...new Set([...s.hung, id])] })),
      finishHanging: () =>
        set((s) => ({
          hanging: [],
          phase: s.hung.length === MEMORIES.length ? "finale" : "explore",
        })),
      reset: () => {
        safeStorage.removeItem(LEGACY_SAVE_KEY);
        set({
          collected: [],
          hung: [],
          hanging: [],
          introSeen: false,
          phase: "title",
          paused: false,
          activeMemory: null,
          nearMemory: null,
          toast: null,
          sceneReady: false,
          dedicationOpen: false,
        });
      },
    }),
    {
      name: SAVE_KEY,
      version: SAVE_VERSION,
      storage: createJSONStorage(() => safeStorage),
      partialize: (s) => ({
        collected: s.collected,
        hung: s.hung,
        introSeen: s.introSeen,
        settings: s.settings,
      }),
      migrate: (persisted) => normalizeProgress(persisted),
      merge: (persisted, current) => {
        const restored = normalizeProgress(persisted);
        const settings = { ...current.settings, ...restored.settings };
        return {
          ...current,
          ...restored,
          settings,
          tier: settings.quality === "auto" ? current.tier : settings.quality,
        };
      },
    },
  ),
);
~~~~

## src/ui/TributeInscription.tsx

~~~~tsx
import { FATHER_FULL_NAME, LIFE_YEARS, TRIBUTE_NAME } from "../config";

export function TributeInscription({
  nickname = false,
}: {
  nickname?: boolean;
}) {
  return (
    <div className="tribute-inscription">
      <span className="tribute-name">
        {nickname ? TRIBUTE_NAME : FATHER_FULL_NAME}
      </span>
      <span className="tribute-years">{LIFE_YEARS}</span>
    </div>
  );
}
~~~~

## src/ui/Dedication.tsx

~~~~tsx
import { DEDICATION_MESSAGE, DEDICATION_TEXT, TEXT } from "../config";
import { useStore } from "../store";
import { useDialog } from "../hooks/useDialog";
import { Icon } from "./Icons";
import { TributeInscription } from "./TributeInscription";
import { BrandLogo } from "./BrandLogo";
export function Dedication({ reopened = false }: { reopened?: boolean }) {
  const seen = useStore((s) => s.introSeen),
    skip = useStore((s) => s.settings.skipIntro);
  const muted = useStore((s) => s.settings.muted);
  const proceed = () => {
    if (reopened) useStore.setState({ dedicationOpen: false });
    else {
      useStore.setState({
        phase: seen || skip ? "explore" : "intro",
        sceneReady: false,
      });
    }
  };
  const ref = useDialog(proceed);
  return (
    <div
      className={`overlay dedication ${reopened ? "over-forest" : ""}`}
      ref={ref}
      role="dialog"
      aria-modal="true"
      aria-labelledby="dedication-heading"
      tabIndex={-1}
    >
      <button
        className="icon-button title-mute"
        aria-label={muted ? TEXT.unmute : TEXT.mute}
        onClick={() => useStore.getState().setSettings({ muted: !muted })}
      >
        <Icon name={muted ? "mute" : "sound"} />
      </button>
      <div className="dedication-card">
        <div className="dedication-emblem">
          <BrandLogo />
        </div>
        <div className="eyebrow">{TEXT.dedicationLabel}</div>
        <h2 id="dedication-heading">{DEDICATION_TEXT}</h2>
        <TributeInscription />
        <p>{DEDICATION_MESSAGE}</p>
        <div className="small-rule" />
        <button className="primary" onClick={proceed}>
          {TEXT.continue}
          <Icon name="arrow" />
        </button>
        {!reopened && (
          <label className="checkline">
            <input
              type="checkbox"
              checked={seen || skip}
              onChange={(e) => {
                useStore
                  .getState()
                  .setSettings({ skipIntro: e.target.checked });
                if (seen && !e.target.checked)
                  useStore.setState({ introSeen: false });
              }}
            />
            {TEXT.skipIntro}
          </label>
        )}
      </div>
    </div>
  );
}
~~~~

## src/ui/Finale.tsx

~~~~tsx
import { DEDICATION_TEXT, FINAL_MESSAGE, PROJECT_NAME, TEXT } from "../config";
import { useStore } from "../store";
import { useDialog } from "../hooks/useDialog";
import { Icon } from "./Icons";
import { TributeInscription } from "./TributeInscription";
import { BrandLogo } from "./BrandLogo";
export function Finale() {
  const muted = useStore((s) => s.settings.muted);
  const close = () => useStore.setState({ phase: "explore" });
  const ref = useDialog(close);
  return (
    <div
      className="overlay finale"
      ref={ref}
      role="dialog"
      aria-modal="true"
      aria-labelledby="finale-title"
      tabIndex={-1}
    >
      <button
        className="icon-button title-mute"
        aria-label={muted ? TEXT.unmute : TEXT.mute}
        onClick={() => useStore.getState().setSettings({ muted: !muted })}
      >
        <Icon name={muted ? "mute" : "sound"} />
      </button>
      <div className="finale-content">
        <BrandLogo />
        <div className="eyebrow">{TEXT.finaleLabel}</div>
        <h2 id="finale-title">{FINAL_MESSAGE}</h2>
        <p>{DEDICATION_TEXT}</p>
        <TributeInscription nickname />
        <div className="finale-wordmark">{PROJECT_NAME}</div>
        <button className="primary" onClick={close}>
          {TEXT.explore}
          <Icon name="arrow" />
        </button>
      </div>
    </div>
  );
}
~~~~

## src/ui/PauseMenu.tsx

~~~~tsx
import { useState } from "react";
import { TEXT } from "../config";
import { useStore } from "../store";
import { useDialog } from "../hooks/useDialog";
import { Icon } from "./Icons";
import { TributeInscription } from "./TributeInscription";
import { BrandLogo } from "./BrandLogo";
export function PauseMenu() {
  const settings = useStore((s) => s.settings),
    update = useStore((s) => s.setSettings);
  const [confirm, setConfirm] = useState(false);
  const close = () => useStore.setState({ paused: false });
  const ref = useDialog(close);
  return (
    <div
      className="overlay pause-overlay"
      ref={ref}
      role="dialog"
      aria-modal="true"
      aria-labelledby="pause-heading"
      tabIndex={-1}
    >
      <div className="pause-card">
        <BrandLogo />
        <h2 id="pause-heading">{TEXT.pause}</h2>
        <TributeInscription />
        <p>{TEXT.pauseSub}</p>
        <button className="primary" onClick={close}>
          {TEXT.resume}
          <Icon name="arrow" />
        </button>
        <div className="settings">
          <label>
            {TEXT.sound}
            <button
              className="setting-toggle"
              onClick={() => update({ muted: !settings.muted })}
            >
              {settings.muted ? TEXT.unmuteShort : TEXT.muteShort}
              <Icon name={settings.muted ? "mute" : "sound"} />
            </button>
          </label>
          <label>
            {TEXT.volume}
            <input
              aria-label={TEXT.volume}
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={settings.volume}
              onChange={(e) => update({ volume: Number(e.target.value) })}
            />
          </label>
          <label>
            {TEXT.detail}
            <select
              value={settings.quality}
              onChange={(e) =>
                update({ quality: e.target.value as typeof settings.quality })
              }
              aria-label={TEXT.quality}
            >
              {Object.entries(TEXT.tiers).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <label>
            {TEXT.reduced}
            <input
              type="checkbox"
              checked={settings.reducedMotion}
              onChange={(e) => update({ reducedMotion: e.target.checked })}
            />
          </label>
          <label>
            {TEXT.large}
            <input
              type="checkbox"
              checked={settings.largeText}
              onChange={(e) => update({ largeText: e.target.checked })}
            />
          </label>
          <label>
            {TEXT.skipIntro}
            <input
              type="checkbox"
              checked={settings.skipIntro}
              onChange={(e) => update({ skipIntro: e.target.checked })}
            />
          </label>
        </div>
        <button
          className="text-button"
          onClick={() => {
            close();
            useStore.setState({ dedicationOpen: true });
          }}
        >
          {TEXT.showDedication}
          <Icon name="heart" />
        </button>
        {confirm ? (
          <div className="reset-confirm">
            <p>{TEXT.resetConfirm}</p>
            <button
              className="danger-button"
              onClick={() => {
                useStore.getState().reset();
              }}
            >
              {TEXT.reset}
            </button>
            <button className="text-button" onClick={() => setConfirm(false)}>
              {TEXT.cancel}
            </button>
          </div>
        ) : (
          <button className="reset-button" onClick={() => setConfirm(true)}>
            {TEXT.reset}
          </button>
        )}
      </div>
    </div>
  );
}
~~~~

## src/styles.css

~~~~css
:root {
  --font-serif: "Instrument Serif", serif;
  font-family: var(--font-serif);
  font-style: normal;
  color: #314c3e;
  background: #182e35;
  font-synthesis: none;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  --cream: #f8f1df;
  --green: #365946;
  --gold: #ddc38d;
}
.viewer-sound {
  position: absolute;
  left: 32px;
  top: 30px;
}
.scene {
  isolation: isolate;
}
.wordmark {
  width: max-content;
  margin-inline: auto;
}
.brand-logo {
  display: block;
  width: 28px;
  height: 28px;
  flex-shrink: 0;
  object-fit: contain;
  pointer-events: none;
}
* {
  box-sizing: border-box;
}
html,
body,
#root,
.app {
  margin: 0;
  width: 100%;
  height: 100%;
  height: 100dvh;
  overflow: hidden;
  overscroll-behavior: none;
  touch-action: none;
}
button,
input,
select {
  font: inherit;
}
button {
  cursor: pointer;
  border: 0;
  transition:
    background 0.2s,
    transform 0.2s,
    box-shadow 0.2s;
}
button:hover {
  transform: translateY(-2px);
}
button:disabled {
  cursor: default;
}
button:focus-visible,
a:focus-visible,
input:focus-visible,
select:focus-visible {
  outline: 3px solid #c59441;
  outline-offset: 5px;
}
button svg {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}
p,
h1,
h2 {
  margin: 0;
}
svg {
  width: 24px;
  height: 24px;
}
button:active {
  transform: translateY(0);
}
.eyebrow {
  font-family: "Trebuchet MS", Arial, sans-serif;
  font-size: 10px;
  letter-spacing: 3px;
  font-weight: 500;
  line-height: 1.7;
}
.title-screen {
  position: relative;
  width: 100%;
  height: 100%;
  color: var(--cream);
  isolation: isolate;
}
.title-art {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  z-index: -1;
}
.brand {
  position: absolute;
  left: 5.3%;
  top: 5.5%;
  display: flex;
  align-items: center;
  gap: 12px;
  color: #eee3c7;
  text-decoration: none;
  font-size: 19px;
  letter-spacing: 0.1px;
}
.brand .brand-logo {
  width: 34px;
  height: 34px;
}
.title-content {
  position: absolute;
  left: 50%;
  top: 45%;
  transform: translate(-50%, -50%);
  text-align: center;
  width: min(90%, 650px);
}
.title-content .eyebrow {
  color: #c5cdb3;
  font-size: 10px;
  letter-spacing: 4px;
}
.title-content h1 {
  font-size: clamp(64px, 9.5vw, 132px);
  font-weight: 400;
  letter-spacing: -0.035em;
  line-height: 1.25;
  margin-top: 16px;
  text-shadow: 0 6px 30px #102a3040;
}
.title-dot {
  color: #dbbd7d;
}
.title-sub {
  font-size: clamp(22px, 2.8vw, 32px);
  color: #ded4b6;
  letter-spacing: 0.3px;
  margin-top: 3px;
}
.title-rule {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 17px;
  margin: 28px auto 23px;
  color: #b9bb8d;
}
.title-rule span {
  height: 1px;
  width: 42px;
  background: #e4d6a733;
}
.title-rule .brand-logo {
  width: 30px;
  height: 30px;
}
.title-description {
  white-space: pre-line;
  font-size: 16px;
  line-height: 1.8;
  color: #c2cbb8;
}
.begin-button {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 38px;
  margin: 32px auto 0;
  padding: 18px 30px;
  border-radius: 50px;
  min-width: 210px;
  background: #eee5cd;
  color: #314a3c;
  font-size: 15px;
  box-shadow: 0 4px 25px #0a262025;
}
.begin-button:hover {
  background: #fff2d7;
  box-shadow: 0 0 40px #e2c38720;
}
.sound-note {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 9px;
  font-family: Arial, sans-serif;
  font-size: 10px;
  letter-spacing: 0.4px;
  color: #a8b49f;
  margin-top: 19px;
}
.sound-note svg {
  width: 13px;
  height: 13px;
}
.title-footer {
  position: absolute;
  bottom: max(30px, env(safe-area-inset-bottom));
  left: 5.3%;
  right: 5.3%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 11px;
  color: #a7b79d;
}
.title-footer > span:last-child {
  font:
    8px Arial,
    sans-serif;
  letter-spacing: 2px;
  color: #94a58c;
}
.tiny-star {
  padding: 0 15px;
  color: #d8c585;
}
.overlay {
  position: absolute;
  inset: 0;
  z-index: 20;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 30px;
  overflow-y: auto;
  touch-action: pan-y;
  animation: overlay-in 0.6s ease both;
}
.dedication {
  background: radial-gradient(ellipse at 50% 60%, #2e483d, #172f35);
  color: var(--cream);
}
.dedication-card {
  text-align: center;
  max-width: 590px;
}
.dedication-emblem {
  margin: 0 auto 35px;
  width: 65px;
  height: 65px;
  border: 1px solid #d4bd8133;
  border-radius: 50%;
  display: grid;
  place-items: center;
  color: #d6c087;
}
.dedication-emblem .brand-logo {
  width: 46px;
  height: 46px;
}
.dedication .eyebrow {
  color: #bfc4a6;
}
.tribute-inscription {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin: 22px 0 26px;
  font-family: var(--font-serif);
  font-weight: 400;
  line-height: 1.4;
}
.tribute-name {
  font-size: clamp(20px, 3vw, 29px);
  letter-spacing: 0.2px;
}
.tribute-years {
  font-size: 16px;
  letter-spacing: 1.5px;
  opacity: 0.8;
  white-space: nowrap;
}
.pause-card .tribute-inscription {
  margin: 14px 0 20px;
}
.pause-card .tribute-name {
  font-size: 21px;
}
.pause-card .tribute-years {
  font-size: 14px;
}
.dedication h2 {
  font-size: clamp(18px, 2.2vw, 24px);
  font-weight: 400;
  line-height: 1.7;
  margin: 20px 0;
}
.dedication .tribute-name {
  font-size: clamp(27px, 3.4vw, 40px);
}
.dedication p {
  color: #c7ceb8;
  font-size: 17px;
  line-height: 1.8;
}
.small-rule {
  height: 1px;
  width: 45px;
  margin: 34px auto;
  background: #b8bc9255;
}
.primary {
  background: #355a46;
  color: #fff4df;
  padding: 16px 25px;
  min-height: 48px;
  border-radius: 50px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 24px;
  font-size: 15px;
  box-shadow: 0 6px 22px #193e2420;
}
.primary:hover {
  background: #264a37;
}
.dedication .primary {
  background: #eadfc3;
  color: #344b3b;
  min-width: 180px;
}
.checkline {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 9px;
  font-family: Arial, sans-serif;
  font-size: 11px;
  color: #b2bca8;
  margin-top: 24px;
  min-height: 44px;
}
input[type="checkbox"] {
  accent-color: #648569;
  width: 17px;
  height: 17px;
}
.over-forest {
  background: #213d35e6;
  backdrop-filter: blur(12px);
}
.scene {
  position: absolute;
  inset: 0;
}
.scene canvas {
  outline: none;
  touch-action: none;
}
.hud {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 5;
  color: #304d3c;
}
.hud button {
  pointer-events: auto;
}
.hud-left,
.hud-right {
  position: absolute;
  top: max(26px, env(safe-area-inset-top));
  display: flex;
  gap: 10px;
  align-items: center;
}
.hud-left {
  left: 30px;
}
.hud-right {
  right: 30px;
  gap: 18px;
}
.icon-button {
  width: 46px;
  height: 46px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  background: #faf4e2dd;
  color: #37513e;
  box-shadow: 0 3px 15px #2f523514;
  border: 1px solid #fffae8bb;
  backdrop-filter: blur(10px);
}
.icon-button:hover {
  background: #fff8e9;
}
.hud-center {
  position: absolute;
  top: max(22px, env(safe-area-inset-top));
  left: 50%;
  transform: translateX(-50%);
  text-align: center;
}
.wordmark {
  font-size: 23px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 9px;
  text-shadow: 0 1px 15px #f9f4d5;
}
.wordmark .brand-logo {
  width: 28px;
  height: 28px;
}
.memory-collection {
  margin-top: 16px;
}
.slots {
  display: flex;
  gap: 7px;
  align-items: center;
  justify-content: center;
}
.memory-slot {
  padding: 0;
  overflow: hidden;
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background: #fffae637;
  border: 1px solid #fff6dcaa;
  box-shadow: inset 0 0 0 3px #68836020;
  display: grid;
  place-items: center;
  min-width: 26px;
}
.memory-slot span {
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: #556f4c70;
}
.memory-slot.filled {
  background: #f8efd7;
  border: 2px solid #fff3d0;
  animation: slot-in 0.5s ease;
}
.memory-slot img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.memory-slot.hung {
  border-color: #d4b16f;
  box-shadow: 0 0 12px #e2c58388;
}
.memory-counter {
  display: block;
  margin-top: 10px;
  font-family: Arial, sans-serif;
  font-size: 10px;
  letter-spacing: 1px;
}
.memory-counter > span:first-child {
  color: #809373;
  margin: 0 2px;
}
.counter-label {
  font-size: 8px;
  letter-spacing: 1.7px;
  margin-left: 6px;
  opacity: 0.75;
}
.compass {
  height: 44px;
  width: 44px;
  position: relative;
  transition: opacity 1s;
}
.compass > span {
  position: absolute;
  left: 18px;
  top: -8px;
  font:
    8px Arial,
    sans-serif;
}
.compass-needle {
  position: absolute;
  inset: 4px;
  border: 1px solid #425e4130;
  border-radius: 50%;
  display: grid;
  place-items: center;
}
.compass-needle svg {
  width: 22px;
  transform: rotate(calc(var(--bearing, 0rad) - 90deg));
  color: #4c6748;
}
.forest-label {
  position: absolute;
  bottom: 65px;
  left: 32px;
  display: flex;
  flex-direction: column;
  gap: 7px;
  text-shadow: 0 1px 9px #e2edc6;
}
.forest-label > .eyebrow {
  font-size: 9px;
  letter-spacing: 2.4px;
}
.forest-label > span:nth-child(2) {
  font-size: 15px;
}
.forest-label small {
  font:
    9px Arial,
    sans-serif;
  letter-spacing: 0.6px;
  color: #3f6247;
}
.tree-progress {
  width: 125px;
  height: 2px;
  background: #36513c25;
  margin-top: 4px;
}
.tree-progress i {
  display: block;
  height: 100%;
  background: #c39f58;
  transition: width 1s;
}
.controls-note {
  position: absolute;
  bottom: 26px;
  right: 32px;
  font:
    8px Arial,
    sans-serif;
  letter-spacing: 1.6px;
  color: #3f5e43b0;
}
.controls-note > span {
  margin: 0 8px;
}
.toast {
  position: absolute;
  left: 50%;
  bottom: max(42px, env(safe-area-inset-bottom));
  transform: translateX(-50%);
  background: #fff8e7e6;
  box-shadow: 0 4px 25px #38573918;
  border: 1px solid #fff8df;
  border-radius: 50px;
  display: flex;
  align-items: center;
  gap: 13px;
  padding: 14px 24px;
  z-index: 7;
  font-size: 13px;
  color: #476046;
  pointer-events: none;
  white-space: nowrap;
  backdrop-filter: blur(8px);
  animation: toast-in 0.5s ease both;
}
.toast svg {
  width: 17px;
  height: 17px;
  color: #728758;
}
.toast .brand-logo {
  width: 22px;
  height: 22px;
}
.hang-button {
  pointer-events: auto;
  position: absolute;
  bottom: 110px;
  left: 50%;
  transform: translateX(-50%);
  background: #3b6047f0;
  white-space: nowrap;
  animation: overlay-in 0.7s ease;
}
.hang-button:hover {
  transform: translateX(-50%) translateY(-2px);
}
.near-memory {
  position: absolute;
  left: 50%;
  bottom: 165px;
  transform: translateX(-50%);
  background: #fff6dfec;
  border: 1px solid #e5c785;
  padding: 12px 19px;
  border-radius: 50px;
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
  color: #54654a;
}
.near-memory:hover {
  transform: translateX(-50%) translateY(-2px);
}
kbd {
  font:
    10px Arial,
    sans-serif;
  background: #e7e5cc;
  border: 1px solid #c8c9ae;
  padding: 4px 6px;
  border-radius: 4px;
  margin-left: 5px;
}
.viewer {
  background: #21392bd0;
  backdrop-filter: blur(12px);
}
.viewer-close {
  position: absolute;
  right: 32px;
  top: 30px;
}
.viewer-layout {
  max-width: 930px;
  width: 100%;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 70px;
  align-items: center;
}
.polaroid-large {
  transform: rotate(-5deg);
  filter: drop-shadow(0 20px 35px #11261770);
  animation: picture-in 0.7s cubic-bezier(0.2, 0.7, 0.2, 1) both;
  background: #fff6df;
  padding: 0 0 15px;
}
.polaroid-large img {
  width: 100%;
  display: block;
}
.polaroid-large .real-photo {
  height: 390px;
  object-fit: cover;
  padding: 22px 22px 65px;
}
.polaroid-large > span {
  display: block;
  text-align: center;
  color: #857c64;
  font-size: 15px;
  margin-top: -28px;
  padding-bottom: 14px;
}
.memory-story {
  color: #faf0d9;
}
.memory-story > .eyebrow {
  font-size: 9px;
  color: #c9d0b1;
  letter-spacing: 2px;
}
.memory-story h2 {
  font-weight: 400;
  font-size: 38px;
  line-height: 1.25;
  margin: 22px 0 12px;
}
.memory-caption {
  font-size: 19px;
  color: #ded6b7;
}
.story-line {
  font-size: 17px;
  line-height: 1.95;
  color: #dadfc7;
  margin-top: 26px;
  animation: overlay-in 0.8s both;
}
.viewer-actions {
  display: flex;
  gap: 20px;
  align-items: center;
  flex-wrap: wrap;
  margin-top: 34px;
}
.viewer .primary {
  background: #efe5c9;
  color: #3d5742;
}
.text-button {
  background: transparent;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  color: inherit;
  text-decoration: underline;
  text-decoration-color: #81977580;
  text-underline-offset: 6px;
  padding: 12px;
  min-height: 44px;
  font-size: 14px;
}
.save-note {
  display: flex;
  gap: 8px;
  align-items: center;
  font:
    10px Arial,
    sans-serif;
  color: #bdc7aa;
  margin-top: 24px;
}
.save-note svg {
  width: 13px;
  height: 13px;
}
.save-note .brand-logo {
  width: 20px;
  height: 20px;
}
.pause-overlay {
  background: #1d392aa6;
  backdrop-filter: blur(10px);
}
.pause-card {
  background: #f6f0de;
  border: 1px solid #fffbe8;
  border-radius: 24px;
  padding: 30px 36px;
  text-align: center;
  max-width: 420px;
  width: 100%;
  max-height: calc(100dvh - 50px);
  overflow: auto;
  box-shadow: 0 20px 70px #17332140;
}
.pause-card > .brand-logo {
  width: 40px;
  height: 40px;
  margin-inline: auto;
}
.pause-card h2 {
  font-size: 32px;
  font-weight: 400;
  margin: 12px 0;
}
.pause-card > p {
  font-size: 13px;
  color: #7d886c;
  margin: 0 0 22px;
  line-height: 1.6;
}
.pause-card > .primary {
  width: 100%;
}
.settings {
  display: flex;
  flex-direction: column;
  border-top: 1px solid #d1d5bb;
  margin-top: 25px;
  padding-top: 12px;
}
.settings label {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 43px;
  gap: 30px;
  font-size: 13px;
  color: #56694c;
}
.settings select {
  background: #e6e9d4;
  border: 0;
  border-radius: 7px;
  padding: 8px;
  min-width: 95px;
  color: #3d5941;
}
.settings input[type="range"] {
  width: 125px;
  accent-color: #59764e;
}
.setting-toggle {
  display: flex;
  gap: 10px;
  align-items: center;
  background: transparent;
  color: #526b48;
  min-height: 44px;
}
.setting-toggle svg {
  width: 15px;
}
.reset-button {
  background: transparent;
  color: #9a7665;
  font-size: 11px;
  display: block;
  margin: 2px auto;
  padding: 12px;
}
.reset-confirm p {
  font-size: 13px;
  line-height: 1.5;
  color: #8f614f;
  margin-top: 12px;
}
.danger-button {
  padding: 12px 18px;
  border-radius: 30px;
  background: #a05e4b;
  color: #fff0d8;
}
.intro-ui {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 8;
  background: linear-gradient(transparent, #132c3844);
  color: #f8edcf;
  display: flex;
  align-items: center;
  justify-content: center;
}
.intro-ui p {
  font-size: clamp(24px, 4vw, 43px);
  animation: intro-line 4.2s ease both;
  text-align: center;
  padding: 30px;
}
.intro-ui button {
  position: absolute;
  bottom: 40px;
  right: 40px;
  pointer-events: auto;
  font:
    11px Arial,
    sans-serif;
  letter-spacing: 1px;
}
.finale {
  background: linear-gradient(#d8e3b611, #233d2bac);
  pointer-events: auto;
}
.finale-content {
  text-align: center;
  max-width: 650px;
  color: #fcf1d7;
  text-shadow: 0 1px 14px #385a3355;
  animation: finale-in 3s ease both;
}
.finale-content > .brand-logo {
  width: 60px;
  height: 60px;
  margin: 0 auto 25px;
}
.finale h2 {
  font-size: clamp(33px, 5vw, 55px);
  font-weight: 400;
  line-height: 1.3;
  margin: 20px 0;
}
.finale p {
  font-size: 17px;
  line-height: 1.8;
  color: #f1ecd4;
}
.finale-wordmark {
  font-size: 25px;
  margin: 30px 0;
}
.finale .primary {
  background: #f3e8c9;
  color: #3b563e;
  margin-top: 15px;
}
.loading-screen {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 25px;
  background: #183037;
  color: #d9ddba;
  z-index: 30;
  font-size: 14px;
}
.loading-emblem {
  width: 64px;
  height: 64px;
  animation: sprout 1.8s ease-in-out infinite;
}
.loading-emblem .brand-logo {
  width: 100%;
  height: 100%;
}
.loading-track {
  height: 2px;
  width: 120px;
  background: #63765755;
  overflow: hidden;
}
.loading-track i {
  display: block;
  height: 100%;
  background: #d7c484;
  transition: width 0.5s;
}
.fallback {
  position: absolute;
  inset: 0;
  z-index: 31;
  background: #1c3537;
  color: #f4e6c8;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 25px;
  text-align: center;
  padding: 40px;
}
.fallback h2 {
  font-weight: 400;
  font-size: 32px;
}
.fallback p {
  max-width: 460px;
  font-size: 17px;
  line-height: 1.8;
  color: #c6cfb5;
}
.dev-metrics {
  position: absolute;
  bottom: 5px;
  left: 5px;
  pointer-events: none;
  font: 9px monospace;
  color: #fff;
  background: #0006;
  z-index: 9;
}
.large-text .story-line {
  font-size: 21px;
}
.large-text .settings label,
.large-text .toast {
  font-size: 16px;
}
.large-text .dedication p {
  font-size: 21px;
}
.reduced-motion * {
  animation-duration: 0.01ms !important;
  transition-duration: 0.01ms !important;
}
.reduced-motion .loading-emblem {
  animation: none;
}
@keyframes overlay-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
@keyframes picture-in {
  from {
    opacity: 0;
    transform: rotate(-12deg) scale(0.7) translateY(50px);
  }
  to {
    opacity: 1;
    transform: rotate(-5deg) scale(1);
  }
}
@keyframes toast-in {
  from {
    opacity: 0;
    translate: 0 10px;
  }
  to {
    opacity: 1;
    translate: 0 0;
  }
}
@keyframes intro-line {
  0%,
  100% {
    opacity: 0;
  }
  25%,
  75% {
    opacity: 1;
  }
}
@keyframes slot-in {
  from {
    transform: scale(0.2);
  }
  60% {
    transform: scale(1.2);
  }
  to {
    transform: scale(1);
  }
}
@keyframes sprout {
  50% {
    transform: scale(1.06);
    opacity: 0.65;
  }
}
@keyframes finale-in {
  0%,
  20% {
    opacity: 0;
    transform: translateY(15px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}
@media (max-width: 700px) {
  .brand {
    top: max(25px, env(safe-area-inset-top));
    left: 25px;
    font-size: 16px;
  }
  .title-content {
    top: 45%;
  }
  .title-content h1 {
    letter-spacing: -0.035em;
    font-size: 76px;
  }
  .title-content .eyebrow {
    font-size: 8px;
    letter-spacing: 2.8px;
  }
  .title-description {
    font-size: 14px;
  }
  .title-footer {
    left: 25px;
    right: 25px;
    bottom: max(25px, env(safe-area-inset-bottom));
    justify-content: center;
  }
  .title-footer > span:last-child {
    display: none;
  }
  .title-rule {
    margin: 25px auto 20px;
  }
  .begin-button {
    margin-top: 28px;
  }
  .sound-note {
    font-size: 9px;
  }
  .hud-left {
    left: 14px;
    top: max(18px, env(safe-area-inset-top));
    flex-direction: column;
    gap: 8px;
  }
  .hud-right {
    right: 14px;
    top: max(18px, env(safe-area-inset-top));
    gap: 12px;
    flex-direction: column-reverse;
  }
  .icon-button {
    width: 44px;
    height: 44px;
  }
  .hud-center {
    top: max(21px, env(safe-area-inset-top));
  }
  .wordmark {
    font-size: 20px;
  }
  .slots {
    gap: 5px;
  }
  .memory-slot {
    width: 23px;
    height: 23px;
    min-width: 23px;
  }
  .memory-slot.filled {
    width: 30px;
    height: 30px;
    min-width: 30px;
  }
  .memory-collection {
    margin-top: 12px;
  }
  .counter-label {
    display: none;
  }
  .forest-label {
    left: 20px;
    bottom: 97px;
    gap: 5px;
  }
  .forest-label > .eyebrow {
    font-size: 8px;
    letter-spacing: 2px;
  }
  .forest-label > span:nth-child(2) {
    font-size: 12px;
  }
  .forest-label small {
    font-size: 8px;
  }
  .tree-progress {
    width: 95px;
  }
  .controls-note {
    display: none;
  }
  .toast {
    bottom: max(32px, env(safe-area-inset-bottom));
    padding: 13px 18px;
    font-size: 11px;
    max-width: calc(100% - 30px);
    white-space: normal;
    width: max-content;
  }
  .toast svg {
    flex-shrink: 0;
  }
  .hang-button {
    bottom: 165px;
    font-size: 12px;
    padding: 15px 18px;
    gap: 10px;
  }
  .near-memory {
    bottom: 155px;
  }
  .viewer {
    padding: 65px 28px 35px;
  }
  .viewer-layout {
    display: flex;
    flex-direction: column;
    gap: 35px;
    max-width: 430px;
    max-height: 100%;
    overflow-y: auto;
    padding: 20px 10px;
    touch-action: pan-y;
  }
  .polaroid-large {
    width: 65%;
    flex-shrink: 0;
  }
  .polaroid-large > span {
    font-size: 10px;
    margin-top: -23px;
    padding-bottom: 5px;
  }
  .polaroid-large .real-photo {
    height: 240px;
    padding: 14px 14px 45px;
  }
  .memory-story {
    width: 100%;
    text-align: center;
  }
  .memory-story h2 {
    font-size: 28px;
    margin: 14px 0 8px;
  }
  .memory-caption {
    font-size: 16px;
  }
  .story-line {
    font-size: 15px;
    margin-top: 17px;
  }
  .viewer-actions {
    justify-content: center;
    margin-top: 25px;
  }
  .save-note {
    justify-content: center;
    font-size: 9px;
  }
  .viewer-close {
    right: 18px;
    top: max(18px, env(safe-area-inset-top));
  }
  .pause-card {
    padding: 25px;
    max-height: calc(100dvh - 35px);
  }
  .overlay {
    padding: 20px;
  }
  .dedication-card {
    padding: 20px;
  }
  .dedication h2 {
    font-size: 18px;
  }
  .dedication p {
    font-size: 15px;
  }
  .dedication-emblem {
    margin-bottom: 27px;
  }
  .finale p {
    font-size: 15px;
  }
  .intro-ui button {
    right: 20px;
    bottom: 25px;
  }
}
@media (max-height: 600px) {
  .title-content {
    top: 49%;
    transform: translate(-50%, -50%) scale(0.8);
  }
  .title-footer {
    bottom: 15px;
  }
  .brand {
    top: 20px;
  }
  .viewer-layout {
    max-height: 100%;
    overflow: auto;
  }
  .polaroid-large {
    max-width: 270px;
    justify-self: center;
  }
  .dedication-card {
    transform: scale(0.85);
  }
  .hud-center {
    top: 13px;
  }
  .memory-collection {
    margin-top: 7px;
  }
  .forest-label {
    bottom: 55px;
  }
  .toast {
    bottom: 20px;
  }
  .hang-button {
    bottom: 78px;
  }
  .finale-content {
    transform: scale(0.8);
  }
}
.forest-label {
  background: #fbf5e2d6;
  padding: 16px 19px;
  border-radius: 16px;
  backdrop-filter: blur(6px);
  box-shadow: 0 4px 20px #3b583512;
  text-shadow: none;
}
.world-memory-label {
  display: block;
  font: 11px var(--font-serif);
  white-space: nowrap;
  background: #fff3d9e8;
  color: #40573e;
  border: 1px solid #e4ca92;
  border-radius: 20px;
  padding: 8px 14px;
}
.wordmark {
  background: #fff4db66;
  padding: 6px 15px;
  border-radius: 30px;
  backdrop-filter: blur(4px);
}
.title-mute {
  position: absolute;
  right: 5.3%;
  top: 5.5%;
  background: #f9eec414;
  color: #d1c6a1;
  border-color: #d8d3ae26;
  z-index: 2;
}
.title-mute:hover {
  background: #f9eec426;
}
.audio-notice {
  position: absolute;
  bottom: 85px;
  left: 50%;
  transform: translateX(-50%);
  max-width: 300px;
  padding: 12px 20px;
  border-radius: 20px;
  background: #f8efdeda;
  color: #4c6249;
  font-size: 12px;
  text-align: center;
}
@media (max-width: 700px) {
  .memory-collection {
    margin-top: 47px;
  }
  .slots {
    gap: 0;
  }
  .memory-slot,
  .memory-slot.filled {
    width: 44px;
    height: 44px;
    min-width: 44px;
    background: transparent;
    border: 0;
    box-shadow: none;
  }
  .memory-slot span {
    width: 23px;
    height: 23px;
    background: #f7f1d644;
    border: 1px solid #fff2d6b0;
    box-shadow: inset 0 0 0 3px #63815811;
  }
  .memory-slot img {
    width: 29px;
    height: 29px;
    border: 2px solid #fff2d2;
    border-radius: 50%;
  }
  .memory-slot.hung img {
    border-color: #c6a561;
  }
  .memory-counter {
    margin-top: 4px;
  }
  .forest-label {
    padding: 12px 14px;
    bottom: 95px;
  }
  .near-memory kbd {
    display: none;
  }
}
~~~~

## tests/experience.spec.ts

~~~~ts
import { test, expect, type Page } from "@playwright/test";
import { LIFE_YEARS, TRIBUTE_NAME } from "../src/config";
declare global {
  interface Window {
    __DANNY_TEST__: {
      state(): {
        phase: string;
        sceneReady: boolean;
        collected: string[];
        hung: string[];
        nearMemory: string | null;
      };
      place(x: number, z: number): void;
      position(): { x: number; z: number };
      quality(): void;
      metrics(): { calls: number; triangles: number };
    };
  }
}
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    try {
      const saved = JSON.parse(
        localStorage.getItem("the-danny-v1") ||
          '{"version":1,"state":{"settings":{}}}',
      );
      saved.state.settings.quality = "low";
      localStorage.setItem("the-danny-v1", JSON.stringify(saved));
    } catch {
      /* Blocked-storage case is intentional. */
    }
  });
});

// Navigation is seeded through Vite's modules to keep the full eight-memory
// journey repeatable. Movement and proximity are also exercised with real input.
async function state(page: Page) {
  return page.evaluate(
    () =>
      window.__DANNY_TEST__?.state() ?? {
        sceneReady: false,
        phase: "",
        collected: [],
        hung: [],
        nearMemory: null,
      },
  );
}
async function place(page: Page, x: number, z: number) {
  await page.evaluate(({ x, z }) => window.__DANNY_TEST__.place(x, z), {
    x,
    z,
  });
}
async function begin(page: Page, skip = true) {
  await page.goto("/?test=1");
  await expect(page.getByRole("heading", { name: "The Danny." })).toBeVisible();
  await page.getByRole("button", { name: "Tap to begin" }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  if (skip) await page.getByLabel("Skip intro", { exact: true }).check();
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await expect(page.locator(".scene canvas")).toBeVisible();
  await expect
    .poll(async () => (await state(page)).sceneReady, { timeout: 30000 })
    .toBe(true);
  await page.evaluate(() => window.__DANNY_TEST__.quality());
  if (!skip) {
    await expect(page.locator(".intro-ui")).toBeVisible();
    await page.getByRole("button", { name: "Skip intro" }).click();
  }
}

test("the complete memory journey, immediate persistence, finale and reset", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(m.text());
  });
  await page.goto("/?test=1");
  await expect(page.locator(".title-content")).toBeVisible();
  await page.screenshot({
    path: "test-results/title.png",
    animations: "disabled",
  });
  await begin(page, false);
  await page.screenshot({
    path: "test-results/forest.png",
    animations: "disabled",
  });
  const metrics = await page.evaluate(() => window.__DANNY_TEST__.metrics());
  console.log("Clearing rendering budget:", metrics);
  expect(metrics.calls).toBeLessThan(150);
  expect(metrics.triangles).toBeLessThan(1500000);
  const canvas = page.locator(".scene canvas");
  await canvas.focus();
  await page.keyboard.down("KeyD");
  await expect
    .poll(async () => page.evaluate(() => window.__DANNY_TEST__.position().x), {
      timeout: 20000,
    })
    .toBeGreaterThan(0.3);
  await page.keyboard.up("KeyD");
  expect(
    await page.evaluate(() => window.__DANNY_TEST__.position().x),
  ).toBeGreaterThan(0.3);
  await page.mouse.move(1000, 700);
  await page.mouse.down();
  await page.waitForTimeout(500);
  await page.mouse.up();
  await place(page, 10, 10);
  await expect(page.getByRole("button", { name: /Tap to view/ })).toBeVisible();
  await canvas.focus();
  await page.keyboard.press("KeyE");
  await expect(
    page.getByRole("dialog", { name: "[MEMORY TITLE]" }),
  ).toBeVisible();
  await page.screenshot({
    path: "test-results/viewer.png",
    animations: "disabled",
  });
  await page.getByRole("button", { name: "Keep this memory" }).click();
  expect((await state(page)).collected).toEqual(["lake"]);
  expect(
    await page.evaluate(
      () => JSON.parse(localStorage.getItem("the-danny-v2")!).state.collected,
    ),
  ).toEqual(["lake"]);
  await place(page, 0, 6);
  await page
    .getByRole("button", { name: "Hang your memories on the tree" })
    .click();
  await expect.poll(async () => (await state(page)).hung.length).toBe(1);
  await expect.poll(async () => (await state(page)).phase).toBe("explore");
  await page.reload();
  await page.getByRole("button", { name: "Tap to begin" }).click();
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await expect.poll(async () => (await state(page)).sceneReady).toBe(true);
  expect((await state(page)).hung).toEqual(["lake"]);
  expect((await state(page)).phase).toBe("explore");
  const memories: [string, number, number][] = [
    ["sunrise", -15, 12],
    ["dinner", -24, -7],
    ["boat", 24, -9],
    ["garden", 15, -25],
    ["guitar", -10, -28],
    ["road", 30, 22],
    ["fire", -33, 27],
  ];
  for (const [id, x, z] of memories) {
    await place(page, x, z);
    await expect.poll(async () => (await state(page)).nearMemory).toBe(id);
    await page.getByRole("button", { name: /Tap to view/ }).click();
    await page.getByRole("button", { name: "Keep this memory" }).click();
  }
  await place(page, 0, 6);
  await page
    .getByRole("button", { name: "Hang your memories on the tree" })
    .click();
  await expect(
    page.getByRole("dialog", { name: "[Thank you for remembering him.]" }),
  ).toBeVisible({ timeout: 120000 });
  expect((await state(page)).hung.length).toBe(8);
  await expect(page.locator(".finale .tribute-name")).toHaveText(TRIBUTE_NAME);
  await expect(page.locator(".finale .tribute-years")).toHaveText(LIFE_YEARS);
  await page.screenshot({
    path: "test-results/finale.png",
    animations: "disabled",
  });
  await page.getByRole("button", { name: "Keep exploring" }).click();
  await page
    .getByRole("button", { name: /Read A quiet fishing morning/ })
    .click();
  await expect(
    page.getByRole("button", { name: "Keep this memory" }),
  ).toHaveCount(0);
  await page.keyboard.press("Escape");
  await page.getByRole("button", { name: "Pause", exact: true }).click();
  await page.getByLabel("Quality", { exact: true }).selectOption("low");
  await page
    .getByRole("button", { name: "Reset progress", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Reset progress", exact: true })
    .click();
  await expect(page.locator(".title-content")).toBeVisible();
  expect((await state(page)).collected).toEqual([]);
  expect(errors).toEqual([]);
});

test("touch layout, focus trap, settings and blocked storage", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.addInitScript(() => {
    Object.defineProperty(window, "localStorage", {
      get() {
        throw new DOMException("Blocked", "SecurityError");
      },
    });
  });
  await begin(page);
  await page.screenshot({
    path: "test-results/mobile.png",
    animations: "disabled",
  });
  await page.getByRole("button", { name: "Pause", exact: true }).click();
  const dialog = page.getByRole("dialog", { name: "A quiet moment" });
  await expect(dialog).toBeVisible();
  for (let i = 0; i < 15; i++) await page.keyboard.press("Tab");
  expect(
    await dialog.evaluate((node) => node.contains(document.activeElement)),
  ).toBe(true);
  await page.getByLabel("Large text", { exact: true }).check();
  await expect(page.locator(".app")).toHaveClass(/large-text/);
  await page.keyboard.press("Escape");
  await expect(dialog).toHaveCount(0);
  await place(page, 10, 10);
  await page.getByRole("button", { name: /Tap to view/ }).click();
  await page.getByRole("button", { name: "Keep this memory" }).click();
  expect((await state(page)).collected).toEqual(["lake"]);
});
~~~~

## tests/persistence.spec.ts

~~~~ts
import { test, expect } from "@playwright/test";
import { FATHER_FULL_NAME, LIFE_YEARS, TRIBUTE_NAME } from "../src/config";
import {
  createCompatibleStorage,
  normalizeProgress,
  LEGACY_SAVE_KEY,
  SAVE_KEY,
} from "../src/persistence";

function memoryStorage(entries: Record<string, string> = {}) {
  const values = new Map(Object.entries(entries));
  let writes = 0;
  const browserStorage = {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => {
      writes++;
      values.set(key, value);
    },
    removeItem: (key: string) => {
      values.delete(key);
    },
  };
  return { values, browserStorage, writes: () => writes };
}

const preferences = {
  quality: "low",
  muted: true,
  volume: 0.35,
  reducedMotion: true,
  largeText: true,
  skipIntro: true,
};
const legacy = JSON.stringify({
  version: 1,
  state: {
    collected: ["lake", "garden"],
    hung: ["lake"],
    introSeen: true,
    settings: preferences,
  },
});

test("v1 is copied immediately to v2 without changing the legacy backup", async () => {
  const fake = memoryStorage({ [LEGACY_SAVE_KEY]: legacy });
  const storage = createCompatibleStorage(() => fake.browserStorage);
  const upgraded = JSON.parse((await storage.getItem(SAVE_KEY))!);
  expect(upgraded).toEqual({ version: 2, state: JSON.parse(legacy).state });
  expect(fake.values.get(SAVE_KEY)).toBe(JSON.stringify(upgraded));
  expect(fake.values.get(LEGACY_SAVE_KEY)).toBe(legacy);
  expect(fake.writes()).toBe(1);
  await storage.getItem(SAVE_KEY);
  expect(fake.writes()).toBe(1);
});

test("validation deduplicates IDs, preserves hung memories, and checks settings", () => {
  expect(
    normalizeProgress({
      collected: ["lake", "lake", "unknown", 12],
      hung: ["garden", "garden", "unknown"],
      introSeen: "true",
      phase: "finale",
      settings: {
        muted: "false",
        volume: 5,
        quality: "ultra",
        reducedMotion: true,
        largeText: false,
        skipIntro: true,
      },
    }),
  ).toEqual({
    collected: ["lake", "garden"],
    hung: ["garden"],
    introSeen: false,
    settings: {
      volume: 1,
      reducedMotion: true,
      largeText: false,
      skipIntro: true,
    },
  });
  expect(normalizeProgress(null)).toEqual({
    collected: [],
    hung: [],
    introSeen: false,
    settings: {},
  });
  expect(normalizeProgress({ settings: { volume: NaN } }).settings).toEqual({});
  expect(normalizeProgress({ settings: { volume: -1 } }).settings.volume).toBe(
    0,
  );
});

test("existing v2 data, including an empty reset, takes precedence over v1", async () => {
  const empty = JSON.stringify({
    version: 2,
    state: { collected: [], hung: [], introSeen: false, settings: preferences },
  });
  for (const current of [empty, "{broken-json"]) {
    const fake = memoryStorage({
      [SAVE_KEY]: current,
      [LEGACY_SAVE_KEY]: legacy,
    });
    const storage = createCompatibleStorage(() => fake.browserStorage);
    expect(await storage.getItem(SAVE_KEY)).toBe(current);
    expect(fake.writes()).toBe(0);
  }
});

test("corrupt or unsupported legacy envelopes do not crash or create a v2 save", async () => {
  for (const old of [
    "{broken-json",
    "null",
    "[]",
    '{"version":9,"state":{}}',
    '{"version":1,"state":[]}',
    '{"version":1,"state":null}',
  ]) {
    const fake = memoryStorage({ [LEGACY_SAVE_KEY]: old });
    const storage = createCompatibleStorage(() => fake.browserStorage);
    expect(await storage.getItem(SAVE_KEY)).toBeNull();
    expect(fake.writes()).toBe(0);
  }
});

test("blocked and quota-limited storage retain progress within the session", async () => {
  const blocked = createCompatibleStorage(() => {
    throw new Error("Storage blocked");
  });
  expect(await blocked.getItem(SAVE_KEY)).toBeNull();
  await blocked.setItem(SAVE_KEY, legacy);
  expect(await blocked.getItem(SAVE_KEY)).toBe(legacy);
  const fake = memoryStorage({ [LEGACY_SAVE_KEY]: legacy });
  const limited = createCompatibleStorage(() => ({
    ...fake.browserStorage,
    setItem: () => {
      throw new Error("Quota exceeded");
    },
  }));
  const upgraded = await limited.getItem(SAVE_KEY);
  expect(JSON.parse(upgraded!).state.collected).toEqual(["lake", "garden"]);
  expect(await limited.getItem(SAVE_KEY)).toBe(upgraded);
  expect(fake.values.get(LEGACY_SAVE_KEY)).toBe(legacy);
});

test("unchanged persisted data does not repeatedly write to local storage", async () => {
  const fake = memoryStorage();
  const storage = createCompatibleStorage(() => fake.browserStorage);
  await storage.setItem(SAVE_KEY, "same");
  await storage.setItem(SAVE_KEY, "same");
  expect(fake.writes()).toBe(1);
  await storage.setItem(SAVE_KEY, "changed");
  expect(fake.writes()).toBe(2);
});

test("browser migrates v1, shows the identity, restores v2, and keeps reset empty", async ({
  page,
}) => {
  await page.addInitScript(
    ({ key, value }) => {
      if (!sessionStorage.getItem("stage-a-legacy-seeded")) {
        localStorage.setItem(key, value);
        sessionStorage.setItem("stage-a-legacy-seeded", "true");
      }
    },
    { key: LEGACY_SAVE_KEY, value: legacy },
  );
  await page.goto("/?test=1");
  await expect(page.locator(".title-content")).toBeVisible();
  const readSave = () =>
    page.evaluate((key) => JSON.parse(localStorage.getItem(key)!), SAVE_KEY);
  expect((await readSave()).state).toEqual(JSON.parse(legacy).state);
  await page.getByRole("button", { name: "Tap to begin" }).click();
  const dedication = page.getByRole("dialog");
  await expect(dedication.locator(".tribute-name")).toHaveText(
    FATHER_FULL_NAME,
  );
  await expect(dedication.locator(".tribute-years")).toHaveText(LIFE_YEARS);
  for (const viewport of [
    { width: 1100, height: 760 },
    { width: 390, height: 844 },
    { width: 960, height: 640 },
  ]) {
    await page.setViewportSize(viewport);
    const bounds = await dedication.locator(".dedication-card").boundingBox();
    expect(bounds).not.toBeNull();
    expect(bounds!.y).toBeGreaterThanOrEqual(0);
    expect(bounds!.y + bounds!.height).toBeLessThanOrEqual(viewport.height);
  }
  await page.setViewportSize({ width: 1100, height: 760 });
  await page.screenshot({
    path: "test-results/stage-a-dedication.png",
    animations: "disabled",
  });
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await expect
    .poll(() => page.evaluate(() => window.__DANNY_TEST__?.state().sceneReady))
    .toBe(true);
  await page.getByRole("button", { name: "Pause", exact: true }).click();
  const pause = page.getByRole("dialog", { name: "A quiet moment" });
  await expect(pause.locator(".tribute-name")).toHaveText(FATHER_FULL_NAME);
  await expect(pause.locator(".tribute-years")).toHaveText(LIFE_YEARS);
  await expect(page.getByLabel("Quality", { exact: true })).toHaveValue("low");
  await expect(page.getByLabel("Master volume", { exact: true })).toHaveValue(
    "0.35",
  );
  await expect(
    page.getByLabel("Reduced motion", { exact: true }),
  ).toBeChecked();
  await expect(page.getByLabel("Large text", { exact: true })).toBeChecked();
  await page.reload();
  expect((await readSave()).state).toEqual(JSON.parse(legacy).state);
  await page.getByRole("button", { name: "Tap to begin" }).click();
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await expect
    .poll(() => page.evaluate(() => window.__DANNY_TEST__?.state().hung))
    .toEqual(["lake"]);
  await page.getByRole("button", { name: "Pause", exact: true }).click();
  await page
    .getByRole("button", { name: "Reset progress", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Reset progress", exact: true })
    .click();
  await expect(page.locator(".title-content")).toBeVisible();
  expect(
    await page.evaluate((key) => localStorage.getItem(key), LEGACY_SAVE_KEY),
  ).toBeNull();
  await page.reload();
  const reset = (await readSave()).state;
  expect(reset.collected).toEqual([]);
  expect(reset.hung).toEqual([]);
  expect(reset.introSeen).toBe(false);
  expect(reset.settings).toEqual(preferences);
  expect(
    await page.evaluate((key) => localStorage.getItem(key), LEGACY_SAVE_KEY),
  ).toBeNull();
});

for (const version of [2, 1]) {
  test(`browser prefers the current key with a version-${version} envelope`, async ({
    page,
  }) => {
    const state = {
      collected: ["road"],
      hung: [],
      introSeen: false,
      settings: preferences,
    };
    await page.addInitScript(
      ({ oldKey, key, legacy, state, version }) => {
        localStorage.setItem(oldKey, legacy);
        localStorage.setItem(key, JSON.stringify({ version, state }));
      },
      { oldKey: LEGACY_SAVE_KEY, key: SAVE_KEY, legacy, state, version },
    );
    await page.goto("/?test=1");
    await expect(page.locator(".title-content")).toBeVisible();
    const current = await page.evaluate(
      (key) => JSON.parse(localStorage.getItem(key)!),
      SAVE_KEY,
    );
    expect(current).toEqual({ version: 2, state });
  });
}

test("tribute years use thin spaces around an en dash", () => {
  expect(LIFE_YEARS).toBe("1964\u2009–\u20092026");
  expect(TRIBUTE_NAME).toBe('Danilo "Danny" Cambronero');
});
~~~~

## scripts/performance.mjs

~~~~javascript
import { writeFile } from "node:fs/promises";
import { chromium } from "@playwright/test";

// Measure every renderer pass in a frame, including shadows and postprocessing.
// The older gl.info diagnostic shows only the last render pass on some tiers.
const legacy = process.argv.includes("--legacy");
const output = process.argv
  .find((arg) => arg.startsWith("--output="))
  ?.slice(9);
const browser = await chromium.launch({
  args: ["--enable-webgl", "--ignore-gpu-blocklist"],
});
const results = [];
try {
  for (const tier of ["high", "medium", "low"]) {
    const page = await browser.newPage({
      viewport: { width: 960, height: 640 },
      deviceScaleFactor: 1,
    });
    page.setDefaultTimeout(60000);
    await page.addInitScript(
      ({ tier, legacy }) => {
        localStorage.setItem(
          legacy ? "the-danny-v1" : "the-danny-v2",
          JSON.stringify({
            version: legacy ? 1 : 2,
            state: {
              collected: [],
              hung: [],
              introSeen: true,
              settings: {
                quality: tier,
                skipIntro: true,
                muted: true,
                reducedMotion: false,
              },
            },
          }),
        );
      },
      { tier, legacy },
    );
    await page.goto("http://127.0.0.1:5173/?test=1");
    await page.getByRole("button", { name: "Tap to begin" }).click();
    await page.getByRole("button", { name: "Continue", exact: true }).click();
    await page.waitForFunction(
      () => window.__DANNY_TEST__?.state().sceneReady,
      {},
      { timeout: 60000 },
    );
    const result = await page.evaluate(async (tier) => {
      const url = performance
        .getEntriesByType("resource")
        .map((entry) => entry.name)
        .find((name) => name.includes("/@react-three_fiber.js"));
      if (!url) throw new Error("Cannot locate the loaded R3F module");
      const fiber = await import(url);
      const root = fiber._roots.get(document.querySelector(".scene canvas"));
      const gl = root.store.getState().gl;
      const context = gl.getContext();
      const extension = context.getExtension("WEBGL_debug_renderer_info");
      const renderer = extension
        ? context.getParameter(extension.UNMASKED_RENDERER_WEBGL)
        : "unknown";
      const originalReset = gl.info.autoReset;
      gl.info.autoReset = false;
      const frames = [];
      const began = performance.now();
      let end = began;
      const remove = fiber.addAfterEffect(() => {
        const now = performance.now();
        if (now - began >= 4000) {
          frames.push({
            at: now,
            calls: gl.info.render.calls,
            triangles: gl.info.render.triangles,
          });
          end = now;
        }
        gl.info.reset();
      });
      await new Promise((resolve) => setTimeout(resolve, 12000));
      remove();
      gl.info.autoReset = originalReset;
      if (frames.length < 2) throw new Error("Too few benchmark frames");
      const mean = (key) =>
        Math.round(
          frames.reduce((sum, frame) => sum + frame[key], 0) / frames.length,
        );
      return {
        tier,
        frames: frames.length,
        fps: +(((frames.length - 1) * 1000) / (end - frames[0].at)).toFixed(2),
        calls: mean("calls"),
        triangles: mean("triangles"),
        renderer,
        viewport: "960x640",
        deviceScaleFactor: 1,
      };
    }, tier);
    results.push(result);
    console.log(JSON.stringify(result));
    await page.close();
  }
  if (output)
    await writeFile(output, JSON.stringify(results, null, 2) + "\n", "utf8");
} finally {
  await browser.close();
}
~~~~

## scripts/production-smoke.mjs

~~~~javascript
import { chromium } from "@playwright/test";
import assert from "node:assert/strict";
const browser = await chromium.launch({
  args: ["--enable-webgl", "--ignore-gpu-blocklist"],
});
const page = await browser.newPage({ viewport: { width: 1000, height: 720 } });
const errors = [];
page.on("pageerror", (error) => errors.push(error.message));
page.on("console", (message) => {
  if (message.type() === "error") errors.push(message.text());
});
await page.addInitScript(() =>
  localStorage.setItem(
    "the-danny-v1",
    JSON.stringify({
      version: 1,
      state: {
        settings: { quality: "low", reducedMotion: true, skipIntro: true },
      },
    }),
  ),
);
await page.goto("http://127.0.0.1:4173");
await page.getByRole("button", { name: "Tap to begin" }).click();
assert.equal(
  await page.locator(".dedication .tribute-name").textContent(),
  "Danilo Cambronero",
);
assert.equal(
  await page.locator(".dedication .tribute-years").textContent(),
  "1964\u2009–\u20092026",
);
const upgraded = await page.evaluate(() =>
  JSON.parse(localStorage.getItem("the-danny-v2")),
);
assert.equal(upgraded.version, 2);
assert.equal(upgraded.state.settings.quality, "low");
assert.equal(upgraded.state.settings.reducedMotion, true);
assert.equal(upgraded.state.settings.skipIntro, true);
await page.getByRole("button", { name: "Continue", exact: true }).click();
await page.locator(".scene canvas").waitFor();
await page.locator(".loading-screen").waitFor({ state: "detached" });
await page.screenshot({
  path: "test-results/production.png",
  animations: "disabled",
});
const diagnostics = await page.evaluate(() => "__DANNY_TEST__" in window);
await page.getByRole("button", { name: "Pause", exact: true }).click();
await page.getByRole("button", { name: "Reset progress", exact: true }).click();
await page.getByRole("button", { name: "Reset progress", exact: true }).click();
await page.locator(".title-content").waitFor();
const reset = await page.evaluate(() => ({
  legacy: localStorage.getItem("the-danny-v1"),
  current: JSON.parse(localStorage.getItem("the-danny-v2")),
}));
assert.equal(reset.legacy, null);
assert.deepEqual(reset.current.state.collected, []);
assert.deepEqual(reset.current.state.hung, []);
assert.deepEqual(reset.current.state.settings, upgraded.state.settings);
if (errors.length || diagnostics)
  throw new Error(JSON.stringify({ errors, diagnostics }));
console.log(
  "Production smoke: title → dedication → forest → reset; identity, v1 migration and legacy cleanup verified; no browser errors; no test diagnostics.",
);
await browser.close();
~~~~

## scripts/export-source.mjs

~~~~javascript
import { readdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
const omitted = new Set([
  "node_modules",
  "dist",
  "test-results",
  "playwright-report",
  ".git",
  "SOURCE.md",
  "STAGE-A-SOURCE.md",
]);
async function walk(dir = ".") {
  const entries = await readdir(dir, { withFileTypes: true });
  const result = [];
  for (const entry of entries) {
    if (omitted.has(entry.name) || entry.name.endsWith(".tsbuildinfo"))
      continue;
    const path = join(dir, entry.name).replaceAll("\\", "/");
    if (entry.isDirectory()) result.push(...(await walk(path)));
    else result.push(path.replace(/^\.\//, ""));
  }
  return result.sort();
}
const files = await walk();
const stages = [
  [
    "Stage 1 · Setup, identity, state, opening UI, quality",
    [
      "package.json",
      "package-lock.json",
      "index.html",
      "public/fonts/instrument-serif-LICENSE.txt",
      "tsconfig.json",
      "vite.config.ts",
      ".gitignore",
      "src/config.ts",
      "src/assets/blue-heaven-flower.svg",
      "src/store.ts",
      "src/main.tsx",
      "src/App.tsx",
      "src/styles.css",
      "src/ui/Icons.tsx",
      "src/ui/BrandLogo.tsx",
      "src/ui/LoadingScreen.tsx",
      "src/ui/TitleBackdrop.tsx",
      "src/ui/TitleScreen.tsx",
      "src/ui/Dedication.tsx",
      "src/hooks/useQuality.ts",
      "src/hooks/useReducedMotion.ts",
    ],
  ],
  [
    "Stage 2 · Procedural world, lighting, shaders, life",
    [
      "src/utils/random.ts",
      "src/utils/chunks.ts",
      "src/scene/runtime.ts",
      "src/scene/world.ts",
      "src/textures/paintTexture.ts",
      "src/shaders/wind.ts",
      "src/shaders/ground.ts",
      "src/shaders/water.ts",
      "src/shaders/outline.ts",
      "src/shaders/grain.ts",
      "src/scene/resources.tsx",
      "src/scene/Scene.tsx",
      "src/scene/Lighting.tsx",
      "src/scene/Camera.tsx",
      "src/scene/Ground.tsx",
      "src/scene/Flora.tsx",
      "src/scene/Pond.tsx",
      "src/scene/Particles.tsx",
      "src/scene/Effects.tsx",
    ],
  ],
  [
    "Stage 3 · Walking, collisions, proximity, HUD",
    [
      "src/hooks/usePlayerControls.ts",
      "src/hooks/useProximity.ts",
      "src/scene/Player.tsx",
      "src/scene/MemoryPicture.tsx",
      "src/ui/Intro.tsx",
      "src/ui/Hud.tsx",
      "src/ui/Compass.tsx",
      "src/ui/Toasts.tsx",
    ],
  ],
  [
    "Stage 4 · Pictures, viewer, saved inventory",
    [
      "src/textures/memoryArt.ts",
      "src/hooks/useDialog.ts",
      "src/ui/Viewer.tsx",
      "src/ui/MemorySlots.tsx",
    ],
  ],
  [
    "Stage 5 · Returning memories, growing tree, finale",
    ["src/scene/MemoryTree.tsx", "src/scene/Timeline.tsx", "src/ui/Finale.tsx"],
  ],
  [
    "Stage 6 · Audio, settings, tuning, verification, delivery",
    [
      "src/audio/bridge.ts",
      "src/audio/engine.ts",
      "src/audio/music.ts",
      "src/audio/nature.ts",
      "src/audio/sfx.ts",
      "src/ui/PauseMenu.tsx",
      "src/scene/DevTools.tsx",
      "playwright.config.ts",
      "tests/experience.spec.ts",
      "tests/robustness.spec.ts",
      "scripts/render-info.mjs",
      "scripts/production-smoke.mjs",
      "scripts/export-source.mjs",
      "README.md",
      "VERIFICATION.md",
    ],
  ],
  [
    "Upgrade Stage A · Tribute identity, v2 saves and audit",
    [
      "src/persistence.ts",
      "src/ui/TributeInscription.tsx",
      "tests/persistence.spec.ts",
      "scripts/performance.mjs",
      "scripts/export-stage-a.mjs",
      "STAGE-A-REPORT.md",
      "STAGE-A-BASELINE.json",
      "STAGE-A-AFTER.json",
    ],
  ],
];
let output =
  "# The Danny — complete source\n\nEvery project file is reproduced below, including the pinned dependency lockfile. Generated build, dependency, and test-output folders are excluded. This document is regenerated with `node scripts/export-source.mjs`.\n\n## Full file tree\n\n```text\nthe-danny/\n";
const shown = new Set();
for (const file of [...files, "SOURCE.md", "STAGE-A-SOURCE.md"].sort()) {
  const parts = file.split("/");
  for (let i = 0; i < parts.length; i++) {
    const key = parts.slice(0, i + 1).join("/");
    if (shown.has(key)) continue;
    shown.add(key);
    output += `${"  ".repeat(i + 1)}${parts[i]}${i < parts.length - 1 ? "/" : ""}\n`;
  }
}
output += "```\n";
const included = new Set();
for (const [heading, paths] of stages) {
  output += `\n## ${heading}\n`;
  for (const path of paths) {
    if (!files.includes(path)) continue;
    included.add(path);
    const ext = path.split(".").at(-1),
      language = ["ts", "tsx", "json", "html", "css"].includes(ext)
        ? ext
        : ext === "mjs"
          ? "javascript"
          : ext === "md"
            ? "markdown"
            : "text";
    const contents = await readFile(path, "utf8");
    output += `\n### ${path}\n\n~~~~${language}\n${contents.trimEnd()}\n~~~~\n`;
  }
}
const missing = files.filter((file) => !included.has(file));
if (missing.length)
  throw new Error(
    `Missing source files in stage manifest: ${missing.join(", ")}`,
  );
await writeFile("SOURCE.md", output, "utf8");
console.log(`SOURCE.md: ${included.size} complete files.`);
~~~~

## scripts/export-stage-a.mjs

~~~~javascript
import { readFile, writeFile } from "node:fs/promises";

// Complete changed/new authored files only. SOURCE.md is the separate full-project
// generated bundle; this generated document excludes itself to avoid recursion.
const paths = [
  "package.json",
  "package-lock.json",
  "public/fonts/instrument-serif-LICENSE.txt",
  "src/main.tsx",
  "src/assets/blue-heaven-flower.svg",
  "src/ui/BrandLogo.tsx",
  "src/ui/TitleScreen.tsx",
  "src/ui/Hud.tsx",
  "src/ui/LoadingScreen.tsx",
  "src/ui/Toasts.tsx",
  "src/ui/Viewer.tsx",
  "src/textures/memoryArt.ts",
  "src/config.ts",
  "src/persistence.ts",
  "src/store.ts",
  "src/ui/TributeInscription.tsx",
  "src/ui/Dedication.tsx",
  "src/ui/Finale.tsx",
  "src/ui/PauseMenu.tsx",
  "src/styles.css",
  "tests/experience.spec.ts",
  "tests/persistence.spec.ts",
  "scripts/performance.mjs",
  "scripts/production-smoke.mjs",
  "scripts/export-source.mjs",
  "scripts/export-stage-a.mjs",
  "README.md",
  "STAGE-A-REPORT.md",
  "STAGE-A-BASELINE.json",
  "STAGE-A-AFTER.json",
];
let output =
  "# The Danny — Stage A complete changed files\n\nEvery changed or new authored file for Stage A is reproduced in full below. SOURCE.md is the separate generated full-project bundle.\n\n";
for (const path of paths) {
  const extension = path.split(".").at(-1);
  const language =
    extension === "mjs"
      ? "javascript"
      : extension === "md"
        ? "markdown"
        : extension;
  output += `## ${path}\n\n~~~~${language}\n${(await readFile(path, "utf8")).trimEnd()}\n~~~~\n\n`;
}
await writeFile("STAGE-A-SOURCE.md", output, "utf8");
console.log(`STAGE-A-SOURCE.md: ${paths.length} complete authored files.`);
~~~~

## README.md

~~~~markdown
# The Danny

A memorial forest, built with love. A complete, static Vite / React 18 / strict TypeScript experience. Forest illustrations, geometry, textures, music, and sound effects are generated by code. The supplied flower logo is an editable SVG, recolored for the memorial forest and shared with the favicon. Instrument Serif Regular is bundled locally through `@fontsource/instrument-serif`; the app makes no requests to third-party font services. Optional photo requests use the URLs you add yourself.

Typography uses Instrument Serif Regular for the serif text, with upright styling throughout, including the generated picture labels. Small utility labels retain their sans-serif styling. Instrument Serif is distributed under the SIL Open Font License 1.1; see the [original font project](https://github.com/Instrument/instrument-serif) and [bundled license](public/fonts/instrument-serif-LICENSE.txt). Change `--font-serif` in `src/styles.css` to choose another family.

The logo lives in `src/assets/blue-heaven-flower.svg`. Its petal, stamen and anther gradients use sage, emerald, lime, cream and warm gold from the forest palette. Edit those SVG color stops to recolor it; keep the five-petal paths if you want to preserve the provided shape. `BrandLogo` reuses the same asset across the UI, and `src/main.tsx` uses it for the favicon. Decorative logos stay hidden from screen readers beside the existing accessible names and labels.

## Run

Requires Node.js 20.19+ or 22.12+.

```sh
npm install
npm run dev
npm run build
npm run preview
```

The dev server listens on port 5173 by default. Open its network URL on your phone while connected to the same local network. The production output is `dist/`; no server, database, API keys, or environment variables are required.

## How to personalize

Edit **`src/config.ts`**:

| Field | What to change |
| --- | --- |
| `PROJECT_NAME` | The project title, currently The Danny. |
| `FATHER_FULL_NAME`, `FATHER_NICKNAME` | Danilo Cambronero and Danny. Dedication, inscriptions and friendly hints derive from these values. `TRIBUTE_NAME` inserts the nickname after the first name; edit that expression if your preferred name order differs. |
| `BIRTH_YEAR`, `PASSING_YEAR` | 1964 and 2026. `LIFE_YEARS` derives the inscription using an en dash surrounded by thin spaces. |
| `DEDICATION_TEXT` | The exact dedication sentence, if you want to change its wording. |
| `DEDICATION_MESSAGE` | Replace `[ADD A SHORT, WARM MESSAGE HERE]`. |
| `FINAL_MESSAGE` | Replace `[Thank you for remembering him.]`. |
| `MEMORIES` | All eight `title`, `caption`, `story`, `zone`, and `[x, z]` `position` values. Use `\n` for additional story paragraphs. Keep the eight stable `id` values so existing saved progress continues to match. |
| `MEMORIES[n].imageUrl` | Add an optional HTTPS photo URL. The forest uses a square cover crop inside its generated cream frame; failed loads fall back to the original illustration. |
| `TEXT` | Menu labels, hints, captions, accessible labels, and other interface copy. |
| `PALETTE`, `WORLD`, `QUALITY` | Art colors, world seed / size, and quality settings. |

The defaults intentionally retain the requested clearly marked personal-story placeholders. There are eight finished illustrations: fishing, sunrise, dinner, sailboat, garden, guitar, road trip, and campfire.

For photos, put files you own in `public/photos/` and use URLs such as `/photos/dad-fishing.jpg`. Vite copies them to the same origin in production. Alternatively, use a photo host that permits cross-origin access and sends `Access-Control-Allow-Origin: *` (or your site's origin). A publicly viewable URL does not always permit use as a WebGL texture. Same-origin hosting avoids that problem. Keep images compressed, ideally below 1 MB. The app itself ships without any photo files.

Moving a memory also clears a small area around it during seeded world generation. Choose positions on land, inside approximately `[-85, 85]` on both axes. The pond occupies a circle centered at `[19, 5]` with radius `5.7`. Keep positions outside that circle and avoid placing multiple memories on top of each other.

## Controls and journey

Press and hold the forest to walk toward the ground under your pointer. Mouse, touch, and pen share pointer capture. WASD / arrow keys also move the traveler. Release to ease to a stop. Use E / Space or the nearby picture button to read a memory. Keep it, then return to the central tree and hang your carried memories. Kept memories save immediately; hanging memories save one at a time as they land. The tree blooms and the music gains layers with each returned memory.

The title always comes first, followed by the dedication. The first title tap creates and resumes the audio context. The introduction is skippable; returning visitors skip it by default. The heart reopens the dedication. Kept and hung pictures can be reread from their HUD slots, and hung pictures are also tappable on the tree. The finale offers continued exploration.

Pause / Escape opens sound, master volume, quality, reduced motion, large text, intro skipping, and dedication controls. Reset requires a second confirmation. Saved progress and preferences use `the-danny-v2` in localStorage (schema version 2). On first load without a v2 save, the app copies valid `the-danny-v1` data into v2, preserving collected / hung memories, intro status and all six preferences. The v1 backup stays untouched. An existing v2 save always wins, including an empty reset, so old progress cannot return after resetting. Unknown IDs and invalid preferences are ignored; hung IDs are also included in collected IDs. If storage is blocked or its quota is full, progress remains available for the current session. The migration runs before entering the forest.

Reset clears the current v2 progress and intro status while preserving settings, and removes the legacy v1 backup. Migration retains that backup until the player confirms a reset. Neither key transfers to a different site origin.

## Performance notes

| Tier | Shadows | Postprocessing | Grass | Ambient particles | Max DPR |
| --- | --- | --- | --- | --- | --- |
| High | 1024 | Bloom + vignette | 100% | 480 | 1.75 |
| Medium | 512 | Vignette | 60% | 260 | 1.4 |
| Low | Off | Off | 30% | 120 | 1 |

Touch devices start at Medium. Auto uses Drei's PerformanceMonitor to change tiers and stops oscillation with its fallback. A manual choice overrides it. AdaptiveDpr can further reduce pixel density. The subtle paper shader remains in every tier and requires one small fullscreen draw.

Trees, outlines, grass, bushes, flowers, mushrooms, rocks, logs, reeds, lily pads, leaves, blossoms, footprints, butterflies, fireflies, and birds use instance batches. The 200 × 200 world is divided into 25-unit cells; distant chunks are excluded when the player crosses a culling boundary. Visible instances are packed into shared batches, avoiding a draw call for each chunk. Grass additionally shrinks to zero with distance in the vertex shader. All foliage shares one wind material and uniform set. Procedural textures are cached and mipmapped. Unique picture textures and the unique traveler are deliberately separate meshes.

The simulation, camera, shader uniforms, particles, and instance transforms run through refs / mutable objects. React only updates for discrete events such as proximity changes, collecting, landing a memory, or quality changes. Circle collisions use a spatial grid and push outward so movement slides along obstacles. A single tight directional shadow camera follows the player. Frames stop while paused, reading, viewing the dedication, or in a hidden tab; the audio context suspends while hidden.

The title / dedication code is separate from the lazy forest and audio bundles. Leva, Stats, metrics, and browser-test diagnostics are guarded by `import.meta.env.DEV` and stripped from production. In development, `/?debug=1` exposes wind / light / fog controls and draw / triangle readouts. `/?test=1` enables controlled navigation for the browser tests; it is absent from production builds.

The draw-call and triangle budgets are engineering targets. A headless software WebGL browser checks rendering and behavior; it does **not** establish 60 fps on a physical mid-range phone. Test the production build on your target hardware before claiming that frame rate.

## Verification

```sh
npx playwright install chromium
npm test
node scripts/performance.mjs --output=STAGE-A-AFTER.json
```

Browser tests cover the UI and saved-data boundary, including a real keyboard movement check and keyboard interaction. They use the dev-only navigation helper to reach all eight memories repeatably, rather than spending several minutes walking to each location. They exercise:

- [x] Title → dedication → intro → explore.
- [x] Walk with keyboard; press and hold a pointer to move.
- [x] Approach memory → E to view → keep → immediate localStorage save.
- [x] Return to the tree → hang → reload → restored picture and skipped intro.
- [x] Collect and hang all eight → finale → keep exploring.
- [x] Reread a hung memory with only Close available.
- [x] Pause settings → reset confirmation → empty progress / title.
- [x] Portrait layout, reduced motion, large text, modal focus trap / Escape.
- [x] Blocked localStorage still permits collecting within the session.
- [x] Trusted touch walking, context-loss handling and WebGL-unavailable fallback.

Screenshots from a run are saved under `test-results/`. `VERIFICATION.md` records the actual final results; the list above describes the test coverage rather than asserting an unrun check. Also check real touch walking, mobile audio output, orientation changes, GPU context restoration, and frame pacing on your own devices. The app includes a WebGL availability fallback, scene error boundary, and context-loss recovery screen.

## Deployment

**Vercel:** import this repository as a Vite project; use `npm run build` and output directory `dist`. **Netlify:** use the same build command and publish directory. Both can also host the generated `dist` as a static site. No platform-specific code is needed. Deploy over HTTPS for reliable audio, touch, and browser behavior. Rebuild after editing the config. Existing devices retain progress for the same site origin; a new deployment hostname has its own storage.

## Implementation stages

1. Setup, config, typed persisted state, title, dedication, quality choices.
2. Shared procedural resources, wind / ground / water / paper shaders, chunked instance forest, lighting, camera, ambient life.
3. Pointer / keyboard controls, collisions, proximity, HUD, compass, hints.
4. Eight canvas illustrations, optional photos, focused DOM viewer, saved inventory.
5. Branch anchors, curved picture flights, canopy growth, persistent hanging, finale.
6. Tone.js music / nature / SFX, ducking / mute / hidden-tab handling, accessibility and production checks.

`SOURCE.md` includes the complete file tree and every authored source / setup / test file in full, arranged in this stage order. `package-lock.json` pins the installed dependency graph.

The v2 upgrade is staged. Stage A updates identity and save compatibility; `STAGE-A-REPORT.md` contains the audit, controlled before/after benchmark, migration notes and verified checks. `STAGE-A-SOURCE.md` contains complete changed and new authored files for this stage. Regenerate these source documents with `node scripts/export-stage-a.mjs` and `node scripts/export-source.mjs`. Stages B–F (reference scenery, Philippine flora, audio, idle behavior and About) await the requested “continue” between stages. Contact and custom-track personalization will arrive with their respective stages.
~~~~

## STAGE-A-REPORT.md

~~~~markdown
# The Danny v2 — Stage A

Stage A covers the pre-edit audit, performance baseline, tribute identity and compatible v2 persistence. The audit findings and baseline were gathered before edits. Stages B–F await “continue”; About will receive the shared inscription in Stage F.

## Pre-edit audit

All authored application, configuration, shader, texture, script and test files were read. Generated bundles, installed dependencies and the dependency lockfile were inspected where relevant rather than treated as authored application code.

**State.** Zustand holds phase, inventory, hanging progress, preferences and transient UI state. Version 1 persists collected / hung IDs, intro status and six preferences. Movement and atmosphere live in mutable runtime objects. Previously the version-mismatch migration returned empty progress. Merely changing the persist name would not retrieve the old key.

**World and chunks.** Seed 4217 creates the same 200 × 200 world every visit. Placement reserves the clearing, paths, pond and memory locations. Flora is grouped in 25-unit chunks, packed again when the traveler crosses a 12.5-unit boundary or changes quality. Chunk centers outside the 58 + 18-unit culling radius are excluded. Circle colliders use a spatial grid; grass shrinks with shader distance. There are generic pine and rounded canopy shapes, rather than the requested local species and two species LODs.

**Instancing.** Eleven flora categories and two canopy outline batches share geometry / materials. The Memory Tree batches foliage, blossoms and flowers, and ambient life also uses instances. Shared wind uniforms animate foliage. Each memory needs its own picture texture. Some repeated details remain individual meshes: two boots, bench planks and the eight picture strings. These are small exceptions to the requested v2 guardrail, to address with the relevant later rendering changes.

**Audio.** Audio loads lazily after a user gesture. A single Tone engine owns music, nature and effects buses, master gain and limiter; a bridge dispatches effects. The current generative music is a slow 54 BPM, default-meter piece with pad, plucks and bass, with layers added as memories return and ducking in the viewer. Synthesized wind / water / birds / dusk insects form nature ambience. Hidden tabs pause transport and suspend the audio context. Stage D must add the original waltz, Philippine ambience, custom track and independent mixer controls.

**Quality.** High uses 1024 shadows, bloom + vignette, full grass, 480 ambient particles and max DPR 1.75. Medium uses 512 shadows, vignette, 60% grass, 260 particles and DPR 1.4. Low disables shadows / postprocessing, uses 30% grass, 120 particles and DPR 1. Touch starts at Medium; the performance monitor adapts Auto while respecting manual choices. Some life / bird instance counts stay constant across tiers. Rendering stops for pause, viewer, reopened dedication, hidden tabs and context loss.

**Frame and lifecycle findings.** Scratch vectors, matrices and colors are generally reused. Collision-grid key strings are allocated while walking. Chunk repacking constructs a counts object in a frame callback only at boundaries, not continuously. Player proximity and Timeline landing / completion still write Zustand state from frame callbacks, contrary to the new guardrail. Event writes also serialized unchanged persisted data and wrote it synchronously to localStorage. The Stage A storage adapter now suppresses identical storage writes; serialization still occurs through Zustand and requires later separation of transient updates.

Explicit resource disposal exists, but ownership overlaps with R3F automatic disposal. GPU resources allocated in render-time memo factories need a StrictMode lifecycle audit; abandoned allocations and disposed objects reused during effect replay are risks, not measured leak claims. The dev diagnostic retains a renderer reference after scene unmount, and context listeners have no explicit removal. Audio cleanup is tied to its singleton / HMR lifetime rather than a complete app unmount. Stage F should measure repeated mounts and clean ownership / listeners. HUD compass and title animation loops can also keep running when scene rendering stops. Keyboard held-state cleanup on window blur needs checking. Reduced motion still permits some introduction movement and picture transitions. No new renderer or audio lifecycle behavior is introduced in Stage A.

## Performance before / after

The immutable pre-edit samples are in `STAGE-A-BASELINE.json`; the post-edit samples are in `STAGE-A-AFTER.json`. Both use Chromium / ANGLE SwiftShader software WebGL, a 960 × 640 CSS viewport, device scale factor 1, manually selected tier, the empty central clearing, skipped introduction, sound muted and reduced motion disabled. After scene readiness there is a four-second warm-up followed by approximately eight seconds of sampling. Audio still initializes behind mute. Scene motion remains active, so visible geometry counts can vary slightly with frame timing.

`scripts/performance.mjs` reads the existing R3F renderer through the loaded development module without altering application rendering code. It disables renderer info auto-reset, records totals after each complete frame, then resets counters. This includes shadows and every postprocessing pass. Calls / triangles are rounded means; FPS is measured between sampled frames. The older dev metric can show only the last pass and should not substitute for these totals.

| Tier | Draw calls before | Draw calls after | Triangles before | Triangles after | FPS before | FPS after |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| high | 73 | 73 | 564,148 | 564,149 | 1.01 | 1.17 |
| medium | 57 | 57 | 466,683 | 466,683 | 1.61 | 1.81 |
| low | 44 | 45 | 342,127 | 342,127 | 2.31 | 2.56 |

High sampled 8 frames before / 10 after; Medium 14 / 15; Low 20 / 21. The observed differences are one mean triangle on High and one mean draw call on Low. These short animated-scene samples do not establish a statistically meaningful FPS improvement. No 3D component, shader, placement, material, camera or quality constant was changed.

These software-rendered FPS figures are a controlled local comparison, not a physical-device benchmark or evidence of 60 FPS. The sample sizes are small and FPS varies with host load. Stage A changes DOM inscriptions and save handling; it does not change world geometry, density or quality budgets. Reproduce with a running dev server and `node scripts/performance.mjs --output=STAGE-A-AFTER.json`. The `--legacy` flag exercises legacy-key import; the baseline above was captured against the actual v1 app before any edits.

## Migration and compatibility

- The active key is `the-danny-v2`, schema version 2. The storage adapter explicitly bridges the different v1 key; Zustand's migration callback handles version mismatches within the current key without dropping known data.
- If v2 is absent and a valid version-one envelope exists, normalize and copy it immediately to v2. Preserve stable collected / hung IDs, intro status, mute, volume, quality, reduced motion, large text and intro skipping. Hung IDs are also added to collected IDs to maintain the inventory invariant.
- Drop unknown / duplicate IDs and invalid preference types; clamp finite volume to 0–1 and retain defaults for missing fields. Ignore runtime fields and never load stored actions.
- An existing v2 save always wins, including an empty reset. Corrupt v2 data does not silently restore old v1 progress. Corrupt / unsupported legacy envelopes do not crash or trigger a copy.
- Migration keeps the v1 backup untouched until confirmed reset. A blocked write or quota limit preserves the upgraded data in session memory. A fully blocked localStorage cannot expose prior saved data; the app can still save new progress within that session.
- Confirmed reset writes empty current progress and intro status while retaining preferences, and removes the legacy v1 recovery backup. Migration keeps that backup until reset. An existing empty v2 save also prevents revival if an older app tab writes another v1 save later.

## How to personalize

Edit `src/config.ts`: `PROJECT_NAME`, `FATHER_FULL_NAME`, `FATHER_NICKNAME`, `BIRTH_YEAR`, `PASSING_YEAR`, `DEDICATION_MESSAGE` and `FINAL_MESSAGE`. `LIFE_YEARS` derives the requested thin-space en dash. The inscription and dedication text derive from these values; `TRIBUTE_NAME` inserts the nickname after the first word of the full name, so edit that expression for a different preferred name order.

Edit the eight memory titles, captions, stories and optional `imageUrl` values. Retain their stable IDs for save compatibility. Same-origin photos under `public/photos/` avoid cross-origin texture restrictions. Friendly hints / toasts derive from Danny's nickname; all new visible copy lives in config. The warm-message and final-message placeholders are intentionally preserved. Contact personalization arrives with About in Stage F, and optional custom-track personalization arrives in Stage D.

## Verification

- Passed `npm run build`: strict TypeScript and Vite production compilation. The final build includes the refined inscription layout.
- Passed the full initial suite: **13 tests**, including the full eight-memory journey / finale / reload / reset and both graphics robustness tests (4.1 minutes on this host).
- After refining dedication typography and splitting the two current-key version tests for independent browser contexts, passed **11 targeted tests**: all 10 persistence tests plus the existing portrait / blocked-storage / focus-trap test (36.7 seconds). These include large-text dedication bounds at 1100 × 760, 390 × 844 and 960 × 640. The suite now contains 14 tests. The complete journey and graphics tests ran before the final typography refinements; persistence and portrait accessibility were checked afterward.
- Passed `node scripts/production-smoke.mjs` against the final build: title → dedication → rendered forest → confirmed reset; inscription identity, legacy-key import, removal of the legacy backup and retained preferences; no browser errors and no development test API in production.
- After adding legacy-key removal on reset, rebuilt successfully and passed the targeted migration / reload / reset browser test again (15.6 seconds). Its fixture now seeds v1 only once per tab, so it cannot recreate the backup during reload.
- Completed before/after benchmarks at High, Medium and Low; raw samples retained in both JSON files.
- Reviewed the generated dedication screenshot; the full name is the primary soft-serif inscription, followed by the years.

Existing checks cover title → dedication → intro → explore, keyboard / pointer / trusted touch movement, nearby picture → viewer → keep → immediate save, hang → reload, all eight memories → finale → continued exploration, rereading hung pictures, pause preferences, reset, portrait layout, focus trapping / Escape, reduced motion, large text, blocked storage, context loss and unavailable WebGL. The identity assertions additionally verify dedication, pause and the final nickname tribute. New persistence checks cover legacy import, both current-key versions, current-key precedence, preservation of all preferences, reset removing the legacy backup and staying empty after reload, unknown IDs, corrupt saves, quota fallback and suppression of identical writes.

Species discovery, new idle states, About and the new audio mixer are later-stage checks and are not claimed as verified in Stage A. Leak measurement and device FPS remain outstanding for the relevant later stages / target hardware.

## Typography follow-up

The subsequent font request applies Instrument Serif Regular through the locally bundled `@fontsource/instrument-serif` package. All previous italic styles and Georgia declarations were removed from the UI and generated picture labels; the title tracking was adjusted for Instrument Serif's narrower shapes. Small utility labels retain their sans-serif family. The font license ships under `public/fonts/` and with the production site. These changes do not start Stage B.

Verified a fresh production build, the existing migration / reset / desktop / portrait bounds test (1 passed, 19.4 seconds), and browser font inspection confirming Instrument Serif loaded with normal styling in the title and dedication. Font requests stayed on the site's origin and the bundled license returned HTTP 200. Desktop title and phone dedication screenshots were reviewed. The earlier benchmark table records Stage A before this typography follow-up; geometry and rendering tiers were not changed by the font request.

## Logo follow-up

The provided `src/assets/blue-heaven-flower.svg` is now the project emblem. Its original five-petal paths remain, with cream, lime, sage and emerald gradients, golden stamens and a soft cream outline. The shared `BrandLogo` component uses that asset for title branding, the HUD, dedication, pause, loading, finale, toasts and viewer save notes. The favicon uses the same SVG, replacing the generated leaf icon. Logos beside existing labels are decorative and hidden from screen readers; the loading animation runs on its wrapper and respects reduced motion. The original functional leaf icon remains on the tree-hanging action.

Verified the production build, the existing migration / reset / three-viewport dedication bounds check (1 passed, 19.2 seconds), and production smoke through title → dedication → forest → reset with no browser errors. Browser inspection confirmed loaded title and dedication images and the matching SVG favicon. Reviewed desktop title, portrait dedication, dark / cream previews at 120, 40 and 16 pixels, and the production HUD screenshot. No gameplay, scene geometry or quality tiers changed. The full source exports include the supplied, recolored SVG and every changed UI file.

## Updated file tree

```text
the-danny/
  .gitignore
  README.md
  SOURCE.md
  STAGE-A-AFTER.json
  STAGE-A-BASELINE.json
  STAGE-A-REPORT.md
  STAGE-A-SOURCE.md
  VERIFICATION.md
  index.html
  package-lock.json
  package.json
  playwright.config.ts
  public/
    fonts/
      instrument-serif-LICENSE.txt
  scripts/
    export-source.mjs
    export-stage-a.mjs
    performance.mjs
    production-smoke.mjs
    render-info.mjs
  src/
    App.tsx
    assets/
      blue-heaven-flower.svg
    audio/
      bridge.ts
      engine.ts
      music.ts
      nature.ts
      sfx.ts
    config.ts
    hooks/
      useDialog.ts
      usePlayerControls.ts
      useProximity.ts
      useQuality.ts
      useReducedMotion.ts
    main.tsx
    persistence.ts
    scene/
      Camera.tsx
      DevTools.tsx
      Effects.tsx
      Flora.tsx
      Ground.tsx
      Lighting.tsx
      MemoryPicture.tsx
      MemoryTree.tsx
      Particles.tsx
      Player.tsx
      Pond.tsx
      Scene.tsx
      Timeline.tsx
      resources.tsx
      runtime.ts
      world.ts
    shaders/
      grain.ts
      ground.ts
      outline.ts
      water.ts
      wind.ts
    store.ts
    styles.css
    textures/
      memoryArt.ts
      paintTexture.ts
    ui/
      BrandLogo.tsx
      Compass.tsx
      Dedication.tsx
      Finale.tsx
      Hud.tsx
      Icons.tsx
      Intro.tsx
      LoadingScreen.tsx
      MemorySlots.tsx
      PauseMenu.tsx
      TitleBackdrop.tsx
      TitleScreen.tsx
      Toasts.tsx
      TributeInscription.tsx
      Viewer.tsx
    utils/
      chunks.ts
      random.ts
  tests/
    experience.spec.ts
    persistence.spec.ts
    robustness.spec.ts
  tsconfig.json
  vite.config.ts
```

## Complete changed files

`STAGE-A-SOURCE.md` reproduces all changed / new authored files in full, including the audit and raw benchmark samples. `SOURCE.md` is regenerated as the separate full-project source bundle. No Stage B–F implementation has been started.
~~~~

## STAGE-A-BASELINE.json

~~~~json
[
  {
    "tier": "high",
    "frames": 8,
    "fps": 1.01,
    "calls": 73,
    "triangles": 564148,
    "renderer": "ANGLE (Google, Vulkan 1.3.0 (SwiftShader Device (Subzero) (0x0000C0DE)), SwiftShader driver)",
    "viewport": "960x640",
    "deviceScaleFactor": 1
  },
  {
    "tier": "medium",
    "frames": 14,
    "fps": 1.61,
    "calls": 57,
    "triangles": 466683,
    "renderer": "ANGLE (Google, Vulkan 1.3.0 (SwiftShader Device (Subzero) (0x0000C0DE)), SwiftShader driver)",
    "viewport": "960x640",
    "deviceScaleFactor": 1
  },
  {
    "tier": "low",
    "frames": 20,
    "fps": 2.31,
    "calls": 44,
    "triangles": 342127,
    "renderer": "ANGLE (Google, Vulkan 1.3.0 (SwiftShader Device (Subzero) (0x0000C0DE)), SwiftShader driver)",
    "viewport": "960x640",
    "deviceScaleFactor": 1
  }
]
~~~~

## STAGE-A-AFTER.json

~~~~json
[
  {
    "tier": "high",
    "frames": 10,
    "fps": 1.17,
    "calls": 73,
    "triangles": 564149,
    "renderer": "ANGLE (Google, Vulkan 1.3.0 (SwiftShader Device (Subzero) (0x0000C0DE)), SwiftShader driver)",
    "viewport": "960x640",
    "deviceScaleFactor": 1
  },
  {
    "tier": "medium",
    "frames": 15,
    "fps": 1.81,
    "calls": 57,
    "triangles": 466683,
    "renderer": "ANGLE (Google, Vulkan 1.3.0 (SwiftShader Device (Subzero) (0x0000C0DE)), SwiftShader driver)",
    "viewport": "960x640",
    "deviceScaleFactor": 1
  },
  {
    "tier": "low",
    "frames": 21,
    "fps": 2.56,
    "calls": 45,
    "triangles": 342127,
    "renderer": "ANGLE (Google, Vulkan 1.3.0 (SwiftShader Device (Subzero) (0x0000C0DE)), SwiftShader driver)",
    "viewport": "960x640",
    "deviceScaleFactor": 1
  }
]
~~~~

