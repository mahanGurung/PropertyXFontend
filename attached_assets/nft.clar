
;; title: nft
;; version:
;; summary:
;; description:

;; traits
;;
(impl-trait 'ST1NXBK3K5YYMD6FD41MVNP3JS1GABZ8TRVX023PT.nft-trait.nft-trait)



;; token definitions
;;
(define-non-fungible-token RWA uint)



;; constants
;;
(define-constant contract-owner tx-sender)
(define-constant ERR-OWNER-ONLY (err u100))
(define-constant ERR-NOT-TOKEN-OWNER (err u101))



;; data vars
;;
(define-data-var last-token-id uint u0)

;; data maps
;;

;; public functions
;;
(define-public (transfer (token-id uint) (sender principal) (recipient principal)) 
    (begin 
        (asserts! (is-eq tx-sender sender) ERR-NOT-TOKEN-OWNER)
        (nft-transfer? RWA token-id sender recipient)
    
    )
)

(define-public (mint (recipient principal) (a-id uint)) 
    (let 
        (
            (token-id (+ (var-get last-token-id) u1))
            
        ) 
        (asserts! (is-eq tx-sender contract-owner) ERR-OWNER-ONLY)
        (is-ok (is-true recipient a-id))
        (try! (nft-mint? RWA token-id recipient))
        (var-set last-token-id token-id)
        (ok token-id)
    )
)


;; read only functions
;;

(define-read-only (get-last-token-id)
    (ok (var-get last-token-id ))
)

(define-read-only (get-token-uri (token-id uint)) 
    (ok none)
)

(define-read-only (get-owner (token-id uint)) 
    (ok (nft-get-owner? RWA token-id))
)

;; private functions
;;
(define-private (is-true (recipient principal) (a-id uint)) 
    (let ((assest (unwrap! (contract-call? .rws get-asset recipient a-id) (err 909)))) 
        (ok (get processCompleted assest))
    )
)
