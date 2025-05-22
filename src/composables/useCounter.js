import { ref } from 'vue'

export default function useCounter() {
  const count = ref(0)

  const increment = () => {
    count.value++
  }

  const double = () => {
    count.value *= 2
  }

  return {
    count,
    increment,
    double
  }
}