export type ScavengerHunt = {
  "version": "0.1.0",
  "name": "scavenger_hunt",
  "constants": [
    {
      "name": "EVENT_ORGANIZER",
      "type": "publicKey",
      "value": "pubkey ! (\"fun8eenPrVMJtiQNE7q1iBVDNuY2Lbnc3x8FFgCt43N\")"
    }
  ],
  "instructions": [
    {
      "name": "initialize",
      "accounts": [
        {
          "name": "userState",
          "isMut": true,
          "isSigner": false,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "type": "publicKey",
                "path": "user"
              }
            ]
          }
        },
        {
          "name": "user",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "checkIn",
      "accounts": [
        {
          "name": "userState",
          "isMut": true,
          "isSigner": false,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "type": "publicKey",
                "path": "user"
              }
            ]
          }
        },
        {
          "name": "user",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "eventOrganizer",
          "isMut": false,
          "isSigner": true
        }
      ],
      "args": [
        {
          "name": "location",
          "type": "publicKey"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "userState",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "user",
            "type": "publicKey"
          },
          {
            "name": "lastLocation",
            "type": "publicKey"
          }
        ]
      }
    }
  ]
};

export const IDL: ScavengerHunt = {
  "version": "0.1.0",
  "name": "scavenger_hunt",
  "constants": [
    {
      "name": "EVENT_ORGANIZER",
      "type": "publicKey",
      "value": "pubkey ! (\"fun8eenPrVMJtiQNE7q1iBVDNuY2Lbnc3x8FFgCt43N\")"
    }
  ],
  "instructions": [
    {
      "name": "initialize",
      "accounts": [
        {
          "name": "userState",
          "isMut": true,
          "isSigner": false,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "type": "publicKey",
                "path": "user"
              }
            ]
          }
        },
        {
          "name": "user",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "checkIn",
      "accounts": [
        {
          "name": "userState",
          "isMut": true,
          "isSigner": false,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "type": "publicKey",
                "path": "user"
              }
            ]
          }
        },
        {
          "name": "user",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "eventOrganizer",
          "isMut": false,
          "isSigner": true
        }
      ],
      "args": [
        {
          "name": "location",
          "type": "publicKey"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "userState",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "user",
            "type": "publicKey"
          },
          {
            "name": "lastLocation",
            "type": "publicKey"
          }
        ]
      }
    }
  ]
};