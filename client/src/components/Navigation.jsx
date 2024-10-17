import React from 'react'
import '../App.css'
import '../css/Navigation.css'

const Navigation = () => {
    return (
        <nav>
            <ul>
                <li><h1>Bolt Bucket 🏎️</h1></li>
            </ul>

            <ul>

                <li><a href='/create-car' role='button'>Create</a></li>
                <li><a href='/view-cars' role='button'>View Cars</a></li>
            </ul>
            
        </nav>
    )
}

export default Navigation