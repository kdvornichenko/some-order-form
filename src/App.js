// import logo from './logo.svg'
import './App.css'
import checkIcon from './check.svg'
import styles from './App.module.sass'
import PlaceProduct from './PlaceProduct'
import { initialProducts } from './productsData'
import { useEffect, useRef, useState } from 'react'
import InputMask from 'react-input-mask'
import axios from 'axios'

function App() {
	const [products] = useState(initialProducts)
	const [locker, setLocker] = useState(true)
	const [styleLockerInputWrap, setStyleLockerInputWrap] = useState(true)
	const [totalAmount, setTotalAmount] = useState()
	const modalOrderAccept = useRef()
	const modalOrderInvalid = useRef()
	const [token, setToken] = useState()
	const [chatId, setChatId] = useState()

	let clientPhone = localStorage.getItem('phone')
	if (clientPhone) {
		clientPhone = clientPhone.split('+').join('')
	}

	const handleLockerClick = () => {
		let phone = document.querySelector('input').value.split('_').join('')
		if (phone.length === 18) {
			setLocker(false)
			localStorage.setItem('phone', phone)
		}
		setStyleLockerInputWrap(false)
	}

	let globalOrder
	let total = 0

	const totalAmountOnPage = () => {
		setTimeout(() => {
			let totalAmountPage = []
			let item = document.querySelectorAll('#product')

			item.forEach(e => {
				const amount = e.querySelector('#productAmount').value
				const priceText = e.querySelector('#productPrice').outerText
				const priceDig = priceText.substring(0, priceText.length - 1)

				totalAmountPage.push(amount * priceDig)
				total = totalAmountPage.reduce((acc, number) => acc + number, 0)
			})
			setTotalAmount(total)
		}, 1)
	}

	let message

	const distributorsURL = window.location.toString().includes('distributors')
	const cosmetologistURL = window.location.toString().includes('cosmetologist')
	const testURL = window.location.toString().includes('test')

	useEffect(() => {
		axios.get('https://shop.utonhealth.com/_tokens.json').then(res => {
			if (testURL) {
				setToken(res.data.test.token)
				setChatId(res.data.test.id)
			}
			if (distributorsURL) {
				setToken(res.data.distributors.token)
				setChatId(res.data.distributors.id)
			}
			if (cosmetologistURL) {
				setToken(res.data.cosmetologist.token)
				setChatId(res.data.cosmetologist.id)
			}
		})
	}, [])

	const URI_API = `https://api.telegram.org/bot${token}/sendMessage`

	const handleClickCreateOrder = e => {
		let localOrder = []
		let item = document.querySelectorAll('#product')

		item.forEach(e => {
			const amount = e.querySelector('#productAmount').value
			const name = e.querySelector('#productName').outerText
			const priceText = e.querySelector('#productPrice').outerText
			const priceDig = priceText.substring(0, priceText.length - 1)
			if (amount > 0) {
				localOrder.push(
					`✨${name} - ${amount} ▪️ ${priceText} = ${amount * priceDig}₽ \n`
				)
			}
		})

		if (localOrder.length > 0) {
			globalOrder = String(localOrder).split(',').join('')
			message = `📌Заказ\n\nCosmetic ${
				distributorsURL ? 'Дистрибьютор' : 'Специалист'
			}:\n➕${clientPhone}\n\n..................................................................\n\n📦Состав заказа:\n${globalOrder}\n📄Итого: ${totalAmount}₽${
				testURL ? '\n\nТЕСТ' : ''
			}`

			axios
				.post(URI_API, {
					chat_id: chatId,
					parse_mode: 'html',
					text: message,
				})
				.then(res => {})
				.catch(err => {
					console.warn(err)
				})
				.finally(() => {
					item.forEach(e => {
						e.querySelector('#productAmount').value = 0
					})
					modalOrderAccept.current.style.visibility = 'visible'
					modalOrderAccept.current.style.top = '50%'
					modalOrderAccept.current.style.opacity = '100%'
					setTimeout(() => {
						window.location.reload()
					}, 4000)
				})
		} else {
			modalOrderInvalid.current.style.visibility = 'visible'
			modalOrderInvalid.current.style.top = '50%'
			modalOrderInvalid.current.style.opacity = '100%'
			setTimeout(() => {
				modalOrderInvalid.current.style.visibility = 'hidden'
				modalOrderInvalid.current.style.top = '75%'
				modalOrderInvalid.current.style.opacity = '0'
			}, 3000)
		}
		setTotalAmount(0)
	}

	const PhoneInput = props => {
		return (
			<div className={styles.locker}>
				<div
					className={
						styleLockerInputWrap
							? styles.lockerInputWrap
							: styles.lockerInputWrap + ' ' + styles.lockerInputWrapInvalid
					}
				>
					<InputMask
						key='Locker'
						className={styles.lockerInput}
						mask='+7 (999) 999-99-99'
						onChange={props.onChange}
						defaultValue={clientPhone}
						value={props.value}
						placeholder='+7 (999) 999-99-99'
						name='inputPhone'
						inputMode='numeric'
						pattern='[0-9]*'
					/>
					<label
						className={styles.lockerInputWrapInvalidMessage}
						htmlFor='inputPhone'
					>
						Введите корректный номер телефона
					</label>
				</div>
				<button className={styles.lockerButton} onClick={handleLockerClick}>
					Войти
				</button>
			</div>
		)
	}

	return (
		<div className={styles.App}>
			{locker ? (
				<PhoneInput />
			) : (
				<div className={styles.productList}>
					{products.map(product => (
						<PlaceProduct
							key={product.name}
							product={product}
							distributorsURL={distributorsURL}
							totalAmountOnPage={totalAmountOnPage}
						/>
					))}
					<p className={styles.productListTotal}>
						Итого: {totalAmount ? totalAmount : 0}₽
					</p>
					<button
						className={styles.sendOrderBtn}
						onClick={handleClickCreateOrder}
					>
						Отправить заказ
					</button>
					<div ref={modalOrderAccept} className={styles.orderAccept}>
						<img
							className={styles.orderAcceptCheckIcon}
							src={checkIcon}
							alt=''
						/>{' '}
						Ваш заказ принят! <br /> Наш менеджер скоро свяжется с вами
					</div>
					<div ref={modalOrderInvalid} className={styles.orderInvalid}>
						Пожалуйста, выберите товар
					</div>
				</div>
			)}
		</div>
	)
}

export default App
