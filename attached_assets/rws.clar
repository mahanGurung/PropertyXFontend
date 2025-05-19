
;; title: rws
;; version:
;; summary:
;; description:

;; traits
;;
(impl-trait 'ST1NXBK3K5YYMD6FD41MVNP3JS1GABZ8TRVX023PT.sip-010-trait-ft-standard.sip-010-trait)
(use-trait rws-token .real-World-Asset-Trait.real-world-asset-trait)

;; token definitions
;;
(define-fungible-token PXT u10000)


;; constants
;;
(define-constant MIN_STAKE u100)
(define-constant MAX_VOTE_DURATION u2592000)  ;; ~30 days in seconds
(define-constant PERCENTAGE_THRESHOLD u51)
(define-constant PERCENTAGE_BASE u100)
(define-constant STAKE_LOCK_PERIOD u2592000) ;; ~30 days


;; error codes
(define-constant ERR_NOT_SENDER u100)
(define-constant ERR_NOT_ADMIN u101)
(define-constant ERR_INSUFFICIENT_STAKE u102)
(define-constant ERR_ALREADY_VOTED u103)
(define-constant ERR_TOKEN_NOT_FOUND u105)
(define-constant ERR_VOTING_NOT_PASSED u106)
(define-constant ERR_VOTING_EXPIRED u107)
(define-constant ERR_NO_TIME_GOT u108)

;; data vars
;;

(define-data-var tokenAdmin principal tx-sender)
(define-data-var token-uri (optional (string-utf8 120)) none)
(var-set token-uri (some u"https://mahan.gurung-tamu.com/"))

;; staking tracker
(define-data-var total-staked uint u0)

;; data maps
;;

;; asset storage with creation timestamp
(define-map Assets
  { owner: principal, assetId: uint }
  { name: (string-utf8 120),
    amount: uint,
    ipfsData: (string-utf8 120),
    processCompleted: bool,
    createdAt: uint })

;; KYC storage
(define-map KYC
  { user: principal }
  { processCompleted: bool, ipfsData: (string-utf8 120) })

;; stakes
(define-map Stakes
  { staker: principal }
  { amount: uint, stakedAt: uint }
)


;; votes
(define-map TokenVotes
  { assetOwner: principal, assetId: uint, voter: principal }
  { vote: bool })

(define-map VoteCounts
  { assetOwner: principal, assetId: uint }
  { yes: uint, no: uint })



;; public functions
;;
;; transfer allowed only by sender
(define-public (transfer (amount uint) (sender principal) (recipient principal) (memo (optional (buff 34))))
  (begin
    (asserts! (is-eq tx-sender sender) (err ERR_NOT_SENDER))
    (ft-transfer? PXT amount sender recipient)))

;; mint allowed only by admin
(define-public (mint (amount uint) (recipient principal))
  (begin
    (asserts! (is-eq tx-sender (var-get tokenAdmin)) (err ERR_NOT_ADMIN))
    (ft-mint? PXT amount recipient)))

;; user stakes PXT into contract
(define-public (stake-pxt (amount uint))
  (begin
    (asserts! (>= amount MIN_STAKE) (err ERR_INSUFFICIENT_STAKE))
    (unwrap! (ft-transfer? PXT amount tx-sender (as-contract tx-sender)) (err ERR_INSUFFICIENT_STAKE))
    (let (
      (prev (map-get? Stakes {staker: tx-sender}))
      (now stacks-block-height)
    )
    (if (is-some prev)
      (let (
            (existing (unwrap! prev (err ERR_INSUFFICIENT_STAKE)))
            (new-amt (+ (get amount existing) amount)))
        (map-set Stakes {staker: tx-sender} {amount: new-amt, stakedAt: (get stakedAt existing)}))
        (map-set Stakes {staker: tx-sender} {amount: amount, stakedAt: now})))

    (var-set total-staked (+ (var-get total-staked) amount))
    (ok true)))


(define-public (withdraw-stake)
  (let (
          (stake (unwrap! (map-get? Stakes {staker: tx-sender}) (err ERR_INSUFFICIENT_STAKE)))
          (now stacks-block-height)
          (lock-end (+ (get stakedAt stake) STAKE_LOCK_PERIOD)))
    (asserts! (>= now lock-end) (err ERR_VOTING_EXPIRED))
    (let ((amount (get amount stake)))
      (unwrap! (ft-transfer? PXT amount (as-contract tx-sender) tx-sender) (err ERR_INSUFFICIENT_STAKE))
      (map-delete Stakes {staker: tx-sender})
      (var-set total-staked (- (var-get total-staked) amount))
      (ok true))))


;; submit asset for tokenization with timestamp
(define-public (add-for-tokenization 
                 
                 (assetId     uint) 
                 (name        (string-utf8 120)) 
                 (amount      uint) 
                 (ipfsData    (string-utf8 120)))
  (begin
    (let ((ts stacks-block-height)
          (approved-kyc (unwrap-panic (map-get? KYC {user: tx-sender})))
      )     ;; now ts is a uint
      (asserts! (is-eq true (get processCompleted approved-kyc)) (err 100))
      (map-insert Assets 
                  { owner:    tx-sender,
                    assetId:  assetId }
                  { name:             name,
                    amount:           amount,
                    ipfsData:         ipfsData,
                    processCompleted: false,
                    createdAt:        ts }))           ;; ts is uint, matches schema
    (ok true)))


;; cast vote for an asset tokenization
(define-public (vote-tokenize (assetOwner principal) (assetId uint) (inFavor bool))
  (let ((voter tx-sender))
    (begin
      ;; must stake
      (let ((stake (default-to u0 (get amount (map-get? Stakes {staker: voter})))))
        (asserts! (>= stake MIN_STAKE) (err ERR_INSUFFICIENT_STAKE)))
      ;; within voting window
      (let ((asset (unwrap! (map-get? Assets {owner: assetOwner, assetId: assetId}) (err ERR_TOKEN_NOT_FOUND)))
             (creation (get createdAt asset))
             (now stacks-block-height))
        (asserts! (< now (+ creation MAX_VOTE_DURATION)) (err ERR_VOTING_EXPIRED)))
      ;; haven't voted
      (asserts! (is-none (map-get? TokenVotes {assetOwner: assetOwner, assetId: assetId, voter: voter})) (err ERR_ALREADY_VOTED))
      ;; record vote
      (map-set TokenVotes {assetOwner: assetOwner, assetId: assetId, voter: voter} {vote: inFavor})
      ;; update counts
      (let ((key {assetOwner: assetOwner, assetId: assetId})
             (current (default-to (tuple (yes u0) (no u0)) (map-get? VoteCounts key)))
             (new-yes (if inFavor (+ (get yes current) u1) (get yes current)))
             (new-no (if (not inFavor) (+ (get no current) u1) (get no current))))
        (map-set VoteCounts key { yes: new-yes, no: new-no }))
      (ok true))))

;; complete tokenization only if voting passed and within window
(define-public (complete-tokenization (assetOwner principal) (assetId uint))
  (begin
    (let ((asset (unwrap! (map-get? Assets {owner: assetOwner, assetId: assetId}) (err ERR_TOKEN_NOT_FOUND)))
           (counts (default-to (tuple (yes u0) (no u0)) (map-get? VoteCounts {assetOwner: assetOwner, assetId: assetId})))
           (yesVotes (get yes counts))
           (noVotes (get no counts))
           (total (+ yesVotes noVotes))
           (now stacks-block-height)
           (creation (get createdAt asset)))
      ;; enforce time limit
      (asserts! (< now (+ creation MAX_VOTE_DURATION)) (err ERR_VOTING_EXPIRED))
      ;; require 51% yes
      (asserts! (>= (* yesVotes PERCENTAGE_BASE) (* total PERCENTAGE_THRESHOLD)) (err ERR_VOTING_NOT_PASSED))
      ;; mark completed
      (map-set Assets {owner: assetOwner, assetId: assetId}
               { name: (get name asset),
                 amount: (get amount asset),
                 ipfsData: (get ipfsData asset),
                 processCompleted: true,
                 createdAt: creation })
      (ok true))))

;; KYC process completion
(define-public (kyc (user principal) (ipfsData (string-utf8 120)))
  (begin
    (map-set KYC {user: user} {processCompleted: false, ipfsData: ipfsData})
    (ok true)))

(define-public (complete-kyc (user principal) (ipfsData (string-utf8 120)))
  (begin
    (asserts! (is-eq tx-sender (var-get tokenAdmin)) (err ERR_NOT_ADMIN))
    (map-set KYC {user: user} {processCompleted: true, ipfsData: ipfsData})
    (ok true)))



;; read only functions
;;

(define-read-only (get-balance (account principal))
  (ok (ft-get-balance PXT account))
)

(define-read-only (get-decimals)
    (ok u8)
)

(define-read-only (get-name) 
  (ok "PropertyX")
)

(define-read-only (get-symbol) 
  (ok "PXT")
)

(define-read-only (get-token-uri)
    (ok (var-get token-uri))  ;; Returns the stored URI or `none`
)

(define-read-only (get-total-supply) 
  (ok (ft-get-supply PXT))
)

(define-read-only (get-asset (a-owner principal) (a-id uint))
  (ok (map-get? Assets {owner: a-owner, assetId: a-id}))
)

;; private functions
;;

;; util: fetch current UNIX timestamp
;; (define-private (get-current-ts)
;;   (let ((info (unwrap! (get-stacks-block-info? time stacks-block-height) (err ERR_VOTING_EXPIRED))))
;;     (ok info)))