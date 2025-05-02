import "../styles/Donate.css"
import Navbar from "../components/Navbar"
import Footer from "../components/Footer"
import { Link } from "react-router-dom"

function Donate() {
  return (
    <>
      <Navbar />
      <div className="donate-page-container">
        {/* Background Image */}
        <img src="/images/blockchain.jpg" alt="Background" className="background-image-page" />

        {/* Content */}
        <h1 className="main-heading">Make a Difference with Your Donation</h1>
        <div className="donate-columns">
          {/* Donate by Case Column */}
          <div className="donate-column">
            <img src="/images/case.jpg" alt="Donate by Case" className="background-image-donate" />
            <div className="overlay"></div>
            <div className="text-content">
              <h2>Donate by Case</h2>
              <p>Help specific animals in urgent need by donating directly to their rescue and medical care.</p>
              <Link to="/donate2">
                <button className="view-button">View Cases</button>
              </Link>
            </div>
          </div>

          {/* Donate to Welfare Organization Column */}
          <div className="donate-column">
            <img src="/images/organization.jpg" alt="Donate to Organization" className="background-image-donate" />
            <div className="overlay"></div>
            <div className="text-content">
              <h2>Donate to Welfare Organization</h2>
              <p>Support trusted animal welfare organizations in their efforts to save and protect animals.</p>
              <button className="view-button">View Organizations</button>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  )
}

export default Donate

