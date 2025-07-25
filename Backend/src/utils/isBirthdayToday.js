export const isBirthdayToday = (dob) => {
    if (!dob) return false;
  
    const today = new Date();
    const [year, month, day] = dob.split("-");
  
    return (
      parseInt(month) === today.getMonth() + 1 &&
      parseInt(day) === today.getDate()
    );
  };
