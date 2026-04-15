// API Configuration
const API_CONFIG = { 
    baseURL: 'http://localhost:3000', // Backend URL
    endpoints: {
        leaveLookup: '/api/leaves' // ✅ تم التعديل هنا
    }
};

// Function to make HTTP requests
async function makeRequest(url, options = {}) {
    try {
        const response = await fetch(url, {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        });

        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'حدث خطأ في الطلب');
        }

        return data;
    } catch (error) {
        console.error('خطأ في الطلب:', error);
        throw error;
    }
}

// Function to fetch sick leave data
async function fetchLeaveData(recordId, idNumber) {
    console.log("📥 [fetchLeaveData] القيم المستلمة:", { recordId, idNumber });

    try {
        const url = `${API_CONFIG.baseURL}${API_CONFIG.endpoints.leaveLookup}?search=${idNumber}`;
        
        const response = await makeRequest(url, {
            method: 'GET'
        });

        console.log("✅ البيانات جلبت من API:", response);
        
        if (response.result && response.result.length > 0) {

            // ✅ البحث عن رقم الإجازة
            const item = response.result.find(
                x => x.sickleave_id === recordId
            );

            if (!item) {
                return null;
            }

            return {
                name: item.full_name,
                report_date: item.sickleave_start_date,
                entry_date: item.sickleave_start_date,
                exit_date: item.sickleave_end_date,
                days: item.duration,
                doctor: "غير محدد",
                job_title: "غير محدد"
            };

        } else {
            return null;
        }

    } catch (error) {
        console.error("❌ حدث خطأ في جلب البيانات من API:", error);
        throw error;
    }
}

// Handle leave check form submission
async function handleCheckLeave(event) {
    event.preventDefault();

    const leaveNumber = document.getElementById("leaveNumber").value.trim();
    const idNumber = document.getElementById("idNumber").value.trim();
    const resultDiv = document.getElementById("result");
    const notFound = document.getElementById("notFound");
    const submitButton = document.getElementById("submitButton");

    console.log("📝 [handleCheckLeave] المدخلات من المستخدم:", { leaveNumber, idNumber });

    resultDiv.innerHTML = "";

    if (!leaveNumber || !idNumber) {
        notFound.innerHTML = `
  <p style="
    background: #ffc3c3ff;
    color:#4c0b14;
    border:1px solid #ea5050ff;
    border-radius:7px;
    padding:18px 22px;
    text-align:center;
    font-weight:600;
    line-height:1.6;
    margin:12px 0;
    box-shadow:0 1px 2px rgba(0,0,0,.04);
    direction:rtl;
  ">
   ادخل رمز الخدمة ورقم الهوية.
  </p>
`;
        return;
    }

    try {
        const leaveRecord = await fetchLeaveData(leaveNumber, idNumber);

        if (!leaveRecord) {
            notFound.innerHTML = `
  <p style="
    background: #ffc3c3ff;
    color:#4c0b14;
    border:1px solid #ea5050ff;
    border-radius:7px;
    padding:18px 22px;
    text-align:center;
    font-weight:600;
    line-height:1.6;
    margin:12px 0;
    box-shadow:0 1px 2px rgba(0,0,0,.04);
    direction:rtl;
  ">
    رقم الهوية أو رقم الإجازة غير صحيح
  </p>
`;
            return;
        }

        resultDiv.innerHTML = `
            <div class="result-box">
                <p>الاسم:<br> <span>${leaveRecord.name}</span></p>
                <p>تاريخ إصدار تقرير الإجازة: <br><span>${leaveRecord.report_date}</span></p>
                <p>تبدأ من: <br><span>${leaveRecord.entry_date}</span></p>
                <p>وحتى:<br> <span>${leaveRecord.exit_date}</span></p>
                <p>المدة بالأيام: <br><span>${leaveRecord.days}</span></p>
                <p>اسم الطبيب: <br><span>${leaveRecord.doctor}</span></p>
                <p>المسمى الوظيفي:<br> <span>${leaveRecord.job_title}</span></p>
            </div>
        `;

        submitButton.textContent = "استعلام جديد";
        submitButton.removeEventListener("click", handleCheckLeave);
        submitButton.addEventListener("click", resetForm);

    } catch (error) {
        console.error("❌ Error:", error);
        notFound.innerHTML = `
  <p style="
    background: #ffc3c3ff;
    color:#4c0b14;
    border:1px solid #ea5050ff;
    border-radius:7px;
    padding:18px 22px;
    text-align:center;
    font-weight:600;
    line-height:1.6;
    margin:12px 0;
    box-shadow:0 1px 2px rgba(0,0,0,.04);
    direction:rtl;
  ">
    حدث خطأ في الاتصال بالسيرفر
  </p>
`;
    }
}

// Function to reset the form
function resetForm(event) {
    event.preventDefault();
    
    const resultDiv = document.getElementById("result");
    const notFound = document.getElementById("notFound");
    const submitButton = document.getElementById("submitButton");
    const leaveNumberInput = document.getElementById("leaveNumber");
    const idNumberInput = document.getElementById("idNumber");
    
    leaveNumberInput.value = "";
    idNumberInput.value = "";
    resultDiv.innerHTML = "";
    notFound.innerHTML = "";
    
    submitButton.textContent = "استعلام";
    submitButton.removeEventListener("click", resetForm);
    submitButton.addEventListener("click", handleCheckLeave);
    
    leaveNumberInput.focus();
}