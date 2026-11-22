import type { Booking, BookingStatusRequest } from '../models/booking'

export class BookingCard extends HTMLElement {
  static readonly observedAttributes = ['compact']

  private current: Booking | null = null
  private nameText = document.createElement('h3')
  private seatsText = document.createElement('p')
  private sourceText = document.createElement('p')
  private statusText = document.createElement('p')
  private button = document.createElement('button')

  constructor() {
    super()
    const style = document.createElement('style')
    style.textContent = `
      :host { display: block; min-width: 0; font-family: inherit; }
      article { border: 1px solid #c5d7d0; border-radius: 12px; padding: 16px; background: white; color: #203a34; }
      h3 { margin: 0 0 8px; overflow-wrap: anywhere; }
      p { margin: 6px 0; }
      button { background: var(--booking-accent, #355bd4); color: white; border: 0; border-radius: 6px; padding: 9px 14px; font: inherit; cursor: pointer; }
      button:disabled { background: #dfe6e3; color: #52665e; cursor: default; }
      button:focus-visible { outline: 3px solid #a15c00; outline-offset: 3px; }
    `
    const article = document.createElement('article')
    const note = document.createElement('p')
    const noteSlot = document.createElement('slot')
    noteSlot.name = 'note'
    noteSlot.textContent = 'Комментарий не задан'
    note.append(noteSlot)
    this.button.type = 'button'
    article.append(this.nameText, this.seatsText, this.sourceText, this.statusText, note, this.button)
    this.attachShadow({ mode: 'open' }).append(style, article)
    this.render()
  }

  set booking(value: Booking) {
    this.current = value
    this.render()
  }

  attributeChangedCallback() {
    this.render()
  }

  private render() {
    const booking = this.current
    const compact = this.hasAttribute('compact')
    this.sourceText.hidden = compact

    if (!booking) {
      this.nameText.textContent = 'Ожидаю данные'
      this.seatsText.textContent = ''
      this.sourceText.textContent = ''
      this.statusText.textContent = ''
      this.button.textContent = 'Подтвердить'
      this.button.disabled = true
      return
    }
    const confirmed = booking.status === 'confirmed'
    this.nameText.textContent = booking.name
    this.seatsText.textContent = compact ? `${booking.seats} чел.` : `Участников: ${booking.seats}`
    this.sourceText.textContent = `Источник: ${booking.source}`
    this.statusText.textContent = confirmed ? 'Подтверждена' : 'Новая заявка'
    this.button.textContent = confirmed ? 'Вернуть в очередь' : 'Подтвердить'
    this.button.disabled = false
  }

  private onAction = () => {
    const booking = this.current
    if (!booking) return

    this.dispatchEvent(new CustomEvent<BookingStatusRequest>('booking-status-request', {
      bubbles: true,
      detail: {
        id: booking.id,
        nextStatus: booking.status === 'new' ? 'confirmed' : 'new',
      },
    }))
  }

  connectedCallback() {
    this.button.addEventListener('click', this.onAction)
  }

  disconnectedCallback() {
    this.button.removeEventListener('click', this.onAction)
  }
}

customElements.define('booking-card', BookingCard)
