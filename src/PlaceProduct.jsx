import React, { useState } from 'react'
import styles from './App.module.sass'

function PlaceProduct({ product, distributorsURL, totalAmountOnPage }) {
	const [count, setCount] = useState(0)

	const handlePlus = e => {
		setCount(Number(count + 1))
		totalAmountOnPage(e.target.value)
	}

	const handleMinus = e => {
		if (count > 0) {
			setCount(Number(count - 1))
		}
		totalAmountOnPage()
	}

	const handleCountClick = e => {
		if (e.target.value <= 0) {
			e.target.value = ''
		}
	}

	const handleCountClickOut = e => {
		if (e.target.value === '') {
			e.target.value = 0
		}
	}

	const handleChange = e => {
		if (e.target.value <= 0) {
			setCount(e.target.value)
		} else {
			setCount(Number(e.target.value))
		}
		totalAmountOnPage()
	}

	return (
		<div id='product' className={styles.product}>
			<div id='productName' className={styles.productName}>
				{product.name}
			</div>
			<div id='productPrice' className={styles.productPrice}>
				{distributorsURL
					? product.name === 'Биоактив' || product.name === 'Биолифт'
						? (product.price = 3100)
						: product.price - product.price * 0.3
					: product.price}
				₽
			</div>
			<div className={styles.productAmountControl}>
				<button className={styles.productMinusBtn} onClick={handleMinus}>
					-
				</button>

				<input
					id='productAmount'
					className={styles.productAmount}
					inputMode='numeric'
					pattern='[0-9]*'
					type='number'
					value={count}
					onChange={handleChange}
					onFocus={handleCountClick}
					onBlur={handleCountClickOut}
					autoComplete='off'
				/>

				<button className={styles.productPlusBtn} onClick={handlePlus}>
					+
				</button>
			</div>
		</div>
	)
}

export default PlaceProduct
