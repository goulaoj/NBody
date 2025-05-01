#ifndef __ODEpoint__
#define __ODEpoint__

#include<vector>
#include<sstream>


class ODEpoint{

    public:

        ODEpoint();
        ODEpoint(double t_, const std::vector<double>& v);
        ~ODEpoint() = default;
        
        double& operator[](int); // xvar[i]
        void SetODEpoint(double t_, std::vector<double> v);
        
        double& T(); // accessor to time
        std::vector<double>& X(); // accessor to variables
        const std::vector<double>& X() const;
        
        friend std::ostream& operator<< (std::ostream&, const ODEpoint&);

    private:

        double t; // time
        std::vector<double> xvar; // variables

};

#endif //__ODEpoint__