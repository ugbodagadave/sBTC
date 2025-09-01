;; Payment Processor Contract
;; This contract handles sBTC payment processing for the sBTCPay gateway

;; Define constants
(define-constant ERR-PAYMENT-NOT-FOUND (err u1))
(define-constant ERR-UNAUTHORIZED (err u2))
(define-constant ERR-INVALID-AMOUNT (err u3))
(define-constant ERR-PAYMENT-ALREADY-PROCESSED (err u4))

;; Define data variables
(define-data-var payment-counter uint u0)

;; Define maps for payment storage
(define-map payments
  { id: uint }
  { 
    amount: uint,
    sender: principal,
    recipient: principal,
    status: (string-ascii 20),
    created-at: uint,
    completed-at: (optional uint)
  }
)

;; Define events
(define-event-type payment-created 
  { 
    id: uint,
    amount: uint,
    sender: principal,
    recipient: principal
  }
)

(define-event-type payment-completed 
  { 
    id: uint,
    completed-at: uint
  }
)

;; Public function to create a new payment
(define-public function create-payment
  (recipient principal)
  (amount uint)
  (let
    (
      (id (var-get payment-counter))
      (sender tx-sender)
      (current-time block-height)
    )
    (asserts! (> amount u0) ERR-INVALID-AMOUNT)
    
    ;; Store the payment
    (map-set payments
      { id: id }
      {
        amount: amount,
        sender: sender,
        recipient: recipient,
        status: "pending",
        created-at: current-time,
        completed-at: none
      }
    )
    
    ;; Increment the payment counter
    (var-set payment-counter (+ id u1))
    
    ;; Emit payment created event
    (event payment-created
      {
        id: id,
        amount: amount,
        sender: sender,
        recipient: recipient
      }
    )
    
    (ok id)
  )
)

;; Public function to complete a payment
(define-public function complete-payment
  (payment-id uint)
  (let
    (
      (payment (unwrap! (map-get? payments { id: payment-id }) ERR-PAYMENT-NOT-FOUND))
      (sender tx-sender)
      (current-time block-height)
    )
    ;; Check if sender is authorized (either the original sender or recipient)
    (asserts! (or (is-eq sender (get sender payment)) (is-eq sender (get recipient payment))) ERR-UNAUTHORIZED)
    
    ;; Check if payment is already processed
    (asserts! (is-eq (get status payment) "pending") ERR-PAYMENT-ALREADY-PROCESSED)
    
    ;; Update payment status
    (map-set payments
      { id: payment-id }
      (merge payment
        {
          status: "completed",
          completed-at: (some current-time)
        }
      )
    )
    
    ;; Emit payment completed event
    (event payment-completed
      {
        id: payment-id,
        completed-at: current-time
      }
    )
    
    (ok true)
  )
)

;; Read-only function to get payment details
(define-read-only function get-payment
  (payment-id uint)
  (map-get? payments { id: payment-id })
)

;; Read-only function to get payment status
(define-read-only function get-payment-status
  (payment-id uint)
  (let
    (
      (payment (unwrap! (map-get? payments { id: payment-id }) ERR-PAYMENT-NOT-FOUND))
    )
    (ok (get status payment))
  )
)