import _ from "lodash";
import moment from "moment";

export function formatDate(date) {
  return date ? moment(new Date(date)).format('DD/MM/YYYY') : '';
};

export function formatCurrency(amount) {
  return amount ? `Rs. ${amount.toFixed(2)}` : 'Rs. 0.00';
};

export function formatedLocation(location, customerName) {
  if (!location) return ''
  return `${location.address1}, ${location.address2}\n${location.city} - ${location.pincode}, ${location.state}`
}