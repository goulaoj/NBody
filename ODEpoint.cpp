#include "ODEpoint.h"

//Constructors
ODEpoint::ODEpoint() : t(-1), xvar() {;}
ODEpoint::ODEpoint(double t_, const std::vector<double>& v) : t(t_), xvar(v) {;}

void ODEpoint::SetODEpoint(double t_, std::vector<double> v){
    t = t_;
    xvar = v;
}


//accessors
double& ODEpoint::operator[](int i){return xvar[i];}
double& ODEpoint::T() { return t;} 
std::vector<double>& ODEpoint::X() { return xvar; } 
const std::vector<double>&  ODEpoint::X() const { return xvar; } 

std::ostream& operator<< (std::ostream& os, const ODEpoint& odePoint){
    
    os << "Time ->" << odePoint.t << ", Variables ->";

    for (int i = 0; i < odePoint.xvar.size(); i++){
        os << odePoint.xvar[i];

        if (i != odePoint.xvar.size() -1){
            os << ", ";
        }
    }
    
    return os;
}

